import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import dotenv from 'dotenv';
import path from 'path';
import {MySequence} from './sequence';
import {TasksQueuesService, TasksQueuesServiceBindings} from './services';

dotenv.config();

export {ApplicationConfig};

export class SchedulerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // Bind TasksQueues Config
    this.bind(TasksQueuesServiceBindings.QUEUE_CONFIG).to({
      host: process.env.TASKS_QUEUE_HOST ?? 'localhost',
      port: +(process.env.TASKS_QUEUE_PORT ?? 6379),
      db: +(process.env.TASKS_QUEUE_DATABASE ?? 0),
      username: process.env.TASKS_QUEUE_USER,
      password: process.env.TASKS_QUEUE_PASSWORD,
    });
  }

  async setupQueues(): Promise<void> {
    // Init resources
    const tasksQueuesConfig = await this.get(
      TasksQueuesServiceBindings.QUEUE_CONFIG,
    );
    const tasksQueuesService = new TasksQueuesService(tasksQueuesConfig);
    await tasksQueuesService.init();

    // Bind the resources
    this.bind(TasksQueuesServiceBindings.SERVICE).to(tasksQueuesService);

    // Mount router
    this.mountExpressRouter(
      '/queues/monitor',
      tasksQueuesService.monitor.router,
    );
  }
}

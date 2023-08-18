import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {TasksQueuesDataSource} from './datasources';
import {MySequence} from './sequence';
import {TasksQueuesService, TasksQueuesServiceBindings} from './services';

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
  }

  async setupQueues(): Promise<void> {
    // Init resources
    const tasksQueuesDb = new TasksQueuesDataSource();
    const tasksQueuesService = new TasksQueuesService(tasksQueuesDb);
    await tasksQueuesService.init();

    // Bind the resources
    this.bind('datasources.tasks_queues').to(tasksQueuesDb);
    this.bind(TasksQueuesServiceBindings.SERVICE).to(tasksQueuesService);

    // Mount router
    this.mountExpressRouter(
      '/queues/monitor',
      tasksQueuesService.monitor.router,
    );
  }
}

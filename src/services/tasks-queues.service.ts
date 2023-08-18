import {BullMonitorExpress} from '@bull-monitor/express';
import {BullMQAdapter} from "@bull-monitor/root/dist/bullmq-adapter";
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {Queue, QueueOptions} from 'bullmq';
import {TasksQueuesDataSource} from '../datasources';

export namespace TasksQueuesServiceBindings {
  export const SERVICE = BindingKey.create<TasksQueuesService>(
    'services.TasksQueuesService',
  );
};

@injectable({scope: BindingScope.SINGLETON})
export class TasksQueuesService {

  // Monitor
  public readonly monitor: BullMonitorExpress;

  // Available Queues
  public readonly verificationEmailQueue: Queue;
  public readonly passwordRecovery: Queue;

  constructor(
    @inject('datasources.tasks_queues')
    tasksQueuesDataSource: TasksQueuesDataSource,
  ) {
    console.log('Queues');
    const bullMQSettings: QueueOptions = {
      connection: {
        host: tasksQueuesDataSource.settings.host,
        port: tasksQueuesDataSource.settings.port,
        db: tasksQueuesDataSource.settings.db,
        username: tasksQueuesDataSource.settings.user,
        password: tasksQueuesDataSource.settings.password,
      },
    };

    // Init queues
    this.verificationEmailQueue = new Queue('VerificationEmail', bullMQSettings);
    this.passwordRecovery = new Queue('PasswordRecovery', bullMQSettings);

    // Setup BullMqMonitor
    this.monitor = new BullMonitorExpress({
      queues: [
        new BullMQAdapter(this.verificationEmailQueue),
        new BullMQAdapter(this.passwordRecovery),
      ],
    });
  }
}

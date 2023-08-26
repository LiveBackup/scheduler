import {BullMonitorExpress} from '@bull-monitor/express';
import {BullMQAdapter} from '@bull-monitor/root/dist/bullmq-adapter';
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {Queue, QueueOptions} from 'bullmq';

export namespace TasksQueuesServiceBindings {
  export const SERVICE = BindingKey.create<TasksQueuesService>(
    'services.TasksQueuesService',
  );
  export const QUEUE_CONFIG = BindingKey.create<TasksQueuesConfig>(
    'services.TasksQueuesService.queue.config',
  );
}

export type TasksQueuesConfig = {
  host: string;
  port: number;
  db?: number;
  username?: string;
  password?: string;
};

@injectable({scope: BindingScope.SINGLETON})
export class TasksQueuesService {
  // Monitor
  public readonly monitor: BullMonitorExpress;

  // Available Queues
  public readonly verificationEmailQueue: Queue;
  public readonly passwordRecovery: Queue;
  // Scheduled Queues
  public readonly tokensCleanup: Queue;

  constructor(
    @inject(TasksQueuesServiceBindings.QUEUE_CONFIG)
    tasksQueuesConfig: TasksQueuesConfig,
  ) {
    const bullMQSettings: QueueOptions = {connection: tasksQueuesConfig};

    // Init queues
    this.verificationEmailQueue = new Queue(
      'VerificationEmail',
      bullMQSettings,
    );
    this.passwordRecovery = new Queue('PasswordRecovery', bullMQSettings);
    // Init scheduled queues
    this.tokensCleanup = new Queue('TokensCleanup', bullMQSettings);

    // Setup BullMqMonitor
    this.monitor = new BullMonitorExpress({
      queues: [
        new BullMQAdapter(this.verificationEmailQueue),
        new BullMQAdapter(this.passwordRecovery),
        new BullMQAdapter(this.tokensCleanup),
      ],
    });
  }

  async init() {
    await this.monitor.init();

    // Setup scheduled queues
    // Clean expired tokens every day
    await this.tokensCleanup.add(
      'Automatic tokens CleanUp',
      {},
      {
        repeat: {
          pattern: '0 0 0 * * *',
        },
      },
    );
  }
}

import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  name: 'tasks_queues',
  connector: 'kv-redis',
  host: process.env.TASKS_QUEUE_HOST ?? 'localhost',
  port: +(process.env.TASKS_QUEUE_PORT ?? 6379),
  db: +(process.env.TASKS_QUEUE_DATABASE ?? 0),
  username: process.env.TASKS_QUEUE_USER,
  password: process.env.TASKS_QUEUE_PASSWORD,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class TasksQueuesDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'TasksQueues';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.TasksQueues', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

import {SequenceActions} from '@loopback/rest';
import {Client, createRestAppClient} from '@loopback/testlab';
import {SchedulerApplication} from '../../application';
import {TasksQueuesServiceBindings} from '../../services';
import {tasksQueuesTestdb} from '../fixtures/datasources';

export const givenRunningApp =
  async function (): Promise<SchedulerApplication> {
    const app = new SchedulerApplication({});
    await app.boot();

    // Diasble logging for testing
    app.bind(SequenceActions.LOG_ERROR).to(() => {});

    // Setup the app database and starts it
    app
      .bind(TasksQueuesServiceBindings.QUEUE_CONFIG)
      .to(await tasksQueuesTestdb);
    await app.start();
    await app.setupQueues();

    return app;
  };

export const givenClient = async function (
  app: SchedulerApplication,
): Promise<Client> {
  return createRestAppClient(app);
};

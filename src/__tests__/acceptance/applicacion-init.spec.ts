import {Client} from '@loopback/testlab';
import {SchedulerApplication} from '../../application';
import {givenClient, givenRunningApp} from '../helpers/app.helper';

describe('Acceptance - Application init', () => {
  // Application
  let app: SchedulerApplication;
  let client: Client;

  before(async () => {
    app = await givenRunningApp();
    client = await givenClient(app);
  });

  after(async () => {
    await app.stop();
  });

  it('Exposes the tasks monitor', async () => {
    await client
      .get('/queues/monitor')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });
});

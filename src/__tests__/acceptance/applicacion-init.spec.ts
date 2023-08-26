import {Client} from '@loopback/testlab';
import sinon from 'sinon';
import {SchedulerApplication} from '../../application';
import {givenClient, givenRunningApp} from '../helpers/app.helpers';

describe('Acceptance - Application init', () => {
  // Sinon sandbox
  const sandbox = sinon.createSandbox();
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

  afterEach(() => {
    sandbox.restore();
  });

  it('Exposes the tasks monitor', async () => {
    await client
      .get('/queues/monitor')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });
});

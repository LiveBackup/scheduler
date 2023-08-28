import {expect} from '@loopback/testlab';
import sinon from 'sinon';
import {TasksQueuesService} from '../../services';
import {tasksQueuesTestdb} from '../fixtures/datasources';

describe('Unit testing - TasksQueues service', () => {
  // Sandbox
  const sandbox = sinon.createSandbox();
  // Service under test
  let queuesService: TasksQueuesService;

  before(async () => {
    queuesService = new TasksQueuesService(await tasksQueuesTestdb);
    await queuesService.init();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Schedules repeatable jobs in queues', async () => {
    // Re-define queue service
    queuesService = new TasksQueuesService(await tasksQueuesTestdb);

    // Creates an array with the queues for repeatable jobs
    const queues = [
      {
        queue: queuesService.tokensCleanup,
        spy: {} as sinon.SinonSpy,
        expectedPattern: '0 0 0 * * *',
      },
    ];

    // Creates the spies for the queues
    for (const queue of queues) {
      queue.spy = sinon.spy(queue.queue, 'add');
    }

    // Init hte queuesService
    await queuesService.init();

    // Verify the queues were called
    for (const queue of queues) {
      expect(queue.spy.calledOnce).to.be.True();

      const scheduledJobs = await queue.queue.getJobs();
      expect(scheduledJobs.length).to.be.equal(1);
      const jobPattern = scheduledJobs[0].opts.repeat?.pattern;
      expect(jobPattern).to.be.equal(queue.expectedPattern);
    }
  });
});

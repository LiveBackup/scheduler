import {ValueOrPromise} from '@loopback/core';
import {RedisMemoryServer} from 'redis-memory-server';
import {TasksQueuesConfig} from '../../../services';

const testRedisDB = new RedisMemoryServer();

const config = {
  host: '',
  port: -1,
};

export const tasksQueuesTestdb: ValueOrPromise<TasksQueuesConfig> = new Promise(
  res => {
    Promise.all([testRedisDB.getHost(), testRedisDB.getPort()])
      .then(([host, port]) => {
        config.host = host;
        config.port = port;
        res(config);
      })
      .catch(() => {});
  },
);

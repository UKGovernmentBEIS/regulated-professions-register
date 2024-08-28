import { registerAs } from '@nestjs/config';
import { config as setConfig } from 'dotenv';

import { RedisOptions } from 'ioredis';

setConfig({ path: `.env.${process.env.NODE_ENV}` });

const redisOptsFromUrl = (urlString: string): RedisOptions => {
  const redisOpts: RedisOptions = {};
  try {
    const redisUrl = new URL(urlString);
    redisOpts.port = Number(redisUrl.port) || 6379;
    redisOpts.host = redisUrl.hostname;
    if (redisUrl.password) {
      redisOpts.password = redisUrl.password;
    }
    if (redisUrl.protocol === 'rediss:') {
      redisOpts.tls = {};
    }
  } catch (e) {
    throw new Error(e.message);
  }
  return redisOpts;
};

export default registerAs('redis', () => {
  let redisURI: string;

  if (process.env['VCAP_SERVICES']) {
    const json = JSON.parse(process.env['VCAP_SERVICES']);
    redisURI = json.redis[0].credentials.uri;
  } else {
    redisURI = process.env['REDIS_URI'];
  }

  return {
    redis: redisOptsFromUrl(redisURI),
  };
});

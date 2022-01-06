import { registerAs } from '@nestjs/config';
import { config as setConfig } from 'dotenv';

setConfig({ path: `.env.${process.env.NODE_ENV}` });

export default registerAs('redis', () => {
  let redisURI: string;

  if (process.env['VCAP_SERVICES']) {
    const json = JSON.parse(process.env['VCAP_SERVICES']);
    redisURI = json.redis[0].credentials.uri;
  } else {
    redisURI = process.env['REDIS_URI'];
  }

  return {
    redis: redisURI,
  };
});

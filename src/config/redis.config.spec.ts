import redisConfiguration from './redis.config';

describe('redisConfiguration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('when the VCAP_SERVICES environment variable is set', () => {
    it('should get the redis configuration from the JSON', () => {
      const vcap_json = {
        redis: [
          {
            credentials: {
              uri: 'rediss://:password@host:6379',
            },
          },
        ],
      };

      process.env['VCAP_SERVICES'] = JSON.stringify(vcap_json);

      expect(redisConfiguration()).toEqual({
        redis: {
          port: 6379,
          host: 'host',
          password: 'password',
          tls: {},
        },
      });
    });
  });

  describe('when the VCAP_SERVICES environment variable is not set', () => {
    process.env['REDIS_URI'] = 'redis://localhost:6379';

    it('should get the Redis configuration from the REDIS_URI environment variable', () => {
      expect(redisConfiguration()).toEqual({
        redis: {
          port: 6379,
          host: 'localhost',
        },
      });
    });
  });
});

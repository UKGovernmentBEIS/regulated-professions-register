import opensearchConfiguration from './opensearch.config';

describe('opensearchConfiguration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('when the VCAP_SERVICES environment variable is set', () => {
    it('should get the opensearch configuration from the VCAP_SERVICES json', () => {
      const vcap_json = {
        opensearch: [
          {
            credentials: {
              uri: 'http://:password@host:9200',
            },
          },
        ],
      };

      process.env['VCAP_SERVICES'] = JSON.stringify(vcap_json);

      expect(opensearchConfiguration()).toEqual({
        node: 'http://:password@host:9200',
      });
    });
  });

  describe('when the VCAP_SERVICES environment variable is not set, and the OPENSEARCH_ENDPOINT is set', () => {
    it('should get the opensearch configuration OPENSEARCH_ENDPOINT variable', () => {
      process.env['OPENSEARCH_ENDPOINT'] = 'http://:password@host:9200';

      expect(opensearchConfiguration()).toEqual({
        node: 'http://:password@host:9200',
      });
    });
  });

  describe('when the VCAP_SERVICES & OPENSEARCH_ENDPOINT environment variables are not set', () => {
    process.env['OPENSEARCH_NODE'] = 'http://host:9200';

    it('should get the Opensearch configuration from the OPENSEARCH_NODE environment variable', () => {
      expect(opensearchConfiguration()).toEqual({
        node: 'http://host:9200',
      });
    });
  });
});

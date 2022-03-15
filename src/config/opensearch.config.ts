import { registerAs } from '@nestjs/config';
import { config as setConfig } from 'dotenv';

setConfig({ path: `.env.${process.env.NODE_ENV}` });

export default registerAs('opensearch', () => {
  let opensearchNode: string;

  if (process.env['VCAP_SERVICES']) {
    const json = JSON.parse(process.env['VCAP_SERVICES']);
    opensearchNode = json.opensearch[0].credentials.uri;
  } else {
    opensearchNode = process.env['OPENSEARCH_NODE'];
  }

  return {
    node: opensearchNode,
  };
});

/// <reference types="cypress" />

import Protocol from 'devtools-protocol';
import { login } from './auth0';

/**
 * @type {Cypress.PluginConfig}
 */
export default (
  on: (
    arg0: string,
    arg1: {
      LoginPuppeteer(
        options: any,
      ): Promise<{ callbackUrl: string; cookies: Protocol.Network.Cookie[] }>;
    },
  ) => void,
  config: {
    env: { AUTH0_DOMAIN: string; AUTH_USERNAME: string; AUTH_PASSWORD: string };
  },
) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: '.env.test' });

  config.env.AUTH0_DOMAIN = process.env['AUTH0_DOMAIN'];
  config.env.AUTH_USERNAME = process.env['AUTH_USERNAME'];
  config.env.AUTH_PASSWORD = process.env['AUTH_PASSWORD'];

  on('task', {
    LoginPuppeteer(options) {
      return login(options);
    },
  });

  return config;
};

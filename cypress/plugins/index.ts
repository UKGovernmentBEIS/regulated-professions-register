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
    env: {
      AUTH0_DOMAIN: string;
      ADMIN_USERNAME: string;
      ADMIN_PASSWORD: string;
      EDITOR_USERNAME: string;
      EDITOR_PASSWORD: string;
    };
  },
) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: '.env.test' });

  config.env.AUTH0_DOMAIN = process.env['AUTH0_DOMAIN'];
  config.env.ADMIN_USERNAME = process.env['ADMIN_USERNAME'];
  config.env.ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'];
  config.env.EDITOR_USERNAME = process.env['EDITOR_USERNAME'];
  config.env.EDITOR_PASSWORD = process.env['EDITOR_PASSWORD'];

  on('task', {
    LoginPuppeteer(options) {
      return login(options);
    },
  });

  return config;
};

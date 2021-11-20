/// <reference types="cypress" />
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (_on, config) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: '.env.test' });

  config.env.OKTA_ORG_URL = process.env.OKTA_ORG_URL;
  config.env.AUTH_USERNAME = process.env.AUTH_USERNAME;
  config.env.AUTH_PASSWORD = process.env.AUTH_PASSWORD;
  config.env.OKTA_CLIENT_ID = process.env.OKTA_CLIENT_ID;
  config.env.OKTA_REDIRECT_URL = process.env.OKTA_REDIRECT_URL;

  return config;
};

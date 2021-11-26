/* eslint-disable @typescript-eslint/no-var-requires */

const auth0 = require('./auth0');

module.exports = (on, config) => {
  require('dotenv').config({ path: '.env.test' });

  config.env.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
  config.env.AUTH_USERNAME = process.env.AUTH_USERNAME;
  config.env.AUTH_PASSWORD = process.env.AUTH_PASSWORD;

  on('task', {
    LoginPuppeteer(options) {
      return auth0.Login(options);
    },
  });

  return config;
};

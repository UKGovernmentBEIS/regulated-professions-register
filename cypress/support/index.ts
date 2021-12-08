// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Login with Auth0.
       * @example cy.loginAuth0('admin')
       */
      loginAuth0(role: string): Chainable<Element>;
    }
  }
}

// Import commands.js using ES2015 syntax:
import './commands';

// Seed the database before running the specs
before(() => {
  cy.exec('npm run seed:test');
});

// Alternatively you can use CommonJS syntax:
// require('./commands')

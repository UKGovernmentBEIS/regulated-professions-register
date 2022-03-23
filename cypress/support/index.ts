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

import 'cypress-axe';

interface AxeRule {
  enabled: boolean;
}

export interface AxeRules {
  [ruleId: string]: AxeRule;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Login with Auth0.
       * @example cy.loginAuth0('admin')
       */
      loginAuth0(role?: string): Chainable<Element>;
      /**
       * Translate an i18n string
       * @example cy.translate('errors.forbidden.heading')
       */
      translate(
        translation: string,
        personalisations?: object,
      ): Chainable<string>;

      checkInputValue(label: string, value: string): Chainable<string>;
      checkTextareaValue(label: string, value: string): Chainable<string>;
      checkSummaryListRowValue(key: string, value: string): Chainable<string>;
      checkIndexedSummaryListRowValue(
        key: string,
        value: string,
        index: number,
      ): Chainable<string>;
      checkSummaryListRowMultilineValue(
        key: string,
        lines: string[],
      ): Chainable<string>;
      checkSummaryListRowList(
        key: string,
        listItems: string[],
      ): Chainable<string>;
      clickSummaryListRowAction(key: string, action: string): Chainable<string>;
      checkCorrectNumberOfProfessionsAreShown(
        statuses: ('live' | 'archived' | 'draft')[],
      ): Chainable<string>;
      checkCorrectNumberOfOrganisationsAreShown(
        statuses: ('live' | 'archived' | 'draft')[],
      ): Chainable<string>;
      visitAndCheckAccessibility(url: string): void;
      checkAccessibility(rules?: AxeRules): void;
    }
  }
}

// Import commands.js using ES2015 syntax:
import './commands';

// Purge the Opensearch index and seed the database
// before running the specs
before(() => {
  cy.exec('npm run opensearch:test:purge');
  cy.exec('npm run seed:test');
});

// Alternatively you can use CommonJS syntax:
// require('./commands')

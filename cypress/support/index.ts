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
  type SeedDecisionDataset = {
    profession: string;
    organisation: string;
    year: number;
    status: string;
    routes: {
      countries: [];
    }[];
  };

  type SeedFeedback = {
    feedbackOrTechnical: string;
    satisfaction: string;
    improvements: string;
    visitReason: string;
    visitReasonOther: string;
    contactAuthority: string;
    contactAuthorityNoReason: string;
    problemArea: string;
    problemAreaPage: string;
    problemDescription: string;
    betaSurveyYesNo: string;
    betaSurveyEmail: string;
  };

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
      checkSummaryListRowValueFromSelector(
        selector: string,
        value: string,
      ): Chainable<string>;
      checkSummaryListRowMultilineValue(
        key: string,
        lines: string[],
      ): Chainable<string>;
      checkSummaryListRowList(
        key: string,
        listItems: string[],
      ): Chainable<string>;
      clickSummaryListRowChangeLink(key: string): Chainable<string>;
      checkCorrectNumberOfProfessionsAreShown(
        statuses: ('live' | 'archived' | 'draft')[],
      ): Chainable<string>;
      checkCorrectNumberOfOrganisationsAreShown(
        statuses: ('live' | 'archived' | 'draft')[],
      ): Chainable<string>;
      checkPublishBlocked(
        incompleteSections: string[],
        organisationsNotLive: string[],
        shouldHaveButton?: boolean,
      ): Chainable<string>;
      checkPublishNotBlocked(): Chainable<string>;
      checkVerticalTable(headings: string[], rows: string[][]): void;
      checkHorizontalTable(headings: string[], coulmns: string[][]): void;
      visitAndCheckAccessibility(url: string): void;
      checkAccessibility(rules?: AxeRules): void;
      visitInternalDashboard(): void;
      clickFilterButtonAndCheckAccessibility(): void;
      expandFilters(prefix: string): void;
      getDisplayedDatasets(): Chainable<SeedDecisionDataset[]>;
      checkCsvDownload(
        downloadText: string,
        filename: string,
        filter: (dataset: SeedDecisionDataset) => boolean,
      ): void;
      getFeedback(): Chainable<SeedFeedback[]>;
      checkFeedbackExport(downloadText: string, filename: string): void;
      clickContinueAndCheckBackLink();
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

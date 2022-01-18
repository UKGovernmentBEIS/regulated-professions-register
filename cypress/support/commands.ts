import { getUnixTime } from 'date-fns';
import { translate } from '../plugins/i18n';

import puppeteer from 'puppeteer';

/*
 * Get a username and password from their role
 */
function getUser(role: string): { username: string; password: string } {
  const users = {
    admin: {
      username: Cypress.env('ADMIN_USERNAME'),
      password: Cypress.env('ADMIN_PASSWORD'),
    },
    editor: {
      username: Cypress.env('EDITOR_USERNAME'),
      password: Cypress.env('EDITOR_PASSWORD'),
    },
  };

  return users[role];
}

/*
 * Create the cookie expiration.
 */
function getFutureTime(minutesInFuture: number): number {
  const time = new Date(new Date().getTime() + minutesInFuture * 60000);
  return getUnixTime(time);
}

/**
 * Create a cookie object.
 * @param {*} cookie
 */
function createCookie(cookie: puppeteer.Protocol.Network.Cookie) {
  return {
    name: cookie.name,
    value: cookie.value,
    options: {
      domain: `${cookie.domain.trimLeft()}`,
      expiry: getFutureTime(15),
      httpOnly: cookie.httpOnly,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      session: cookie.session,
    },
  };
}

/**
 * Login via puppeteer and return the redirect url and cookies.
 */
function login(role: string) {
  const { username, password } = getUser(role);
  return cy.task('LoginPuppeteer', {
    username: username,
    password: password,
    loginUrl: 'http://localhost:3000/login',
    callbackUrl: 'http://localhost:3000/callback',
  });
}

/**
 * Login with Auth0.
 */
Cypress.Commands.add('loginAuth0', (role = 'admin') => {
  return cy.session(`logged in user with ${role} role`, () => {
    login(role).then(({ cookies, callbackUrl }) => {
      cookies
        .map(createCookie)
        .forEach((c: any) => cy.setCookie(c.name, c.value, c.options));

      cy.visit(callbackUrl);
    });
  });
});

Cypress.Commands.add(
  'translate',
  (translation: string, personalisations: object = {}) => {
    return translate(translation, personalisations);
  },
);

/**
 * Check a form element's value
 */

Cypress.Commands.add('checkInputValue', (label: string, value: string) => {
  return cy.translate(label).then((formLabel) => {
    cy.get('body').should('contain', formLabel);
    cy.get('label')
      .contains(formLabel)
      .siblings('input')
      .then(($input) => {
        cy.wrap($input).should('have.value', value);
      });
  });
});

Cypress.Commands.add('checkTextareaValue', (label: string, value: string) => {
  return cy.translate(label).then((formLabel) => {
    cy.get('body').should('contain', formLabel);
    cy.get('label')
      .contains(formLabel)
      .siblings('textarea')
      .then(($textarea) => {
        cy.wrap($textarea).should('contain', value);
      });
  });
});

Cypress.Commands.add(
  'checkSummaryListRowValue',
  (key: string, value: string) => {
    return cy.translate(key).then((label) => {
      cy.get('.govuk-summary-list__key')
        .contains(label)
        .siblings('.govuk-summary-list__value')
        .then(($summaryListValue) => {
          cy.wrap($summaryListValue).should('contain', value);
        });
    });
  },
);

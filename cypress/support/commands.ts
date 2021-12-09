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

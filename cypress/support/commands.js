/* eslint-disable @typescript-eslint/no-var-requires */

const { getUnixTime } = require('date-fns');

/*
 * Create the cookie expiration.
 */
function getFutureTime(minutesInFuture) {
  const time = new Date(new Date().getTime() + minutesInFuture * 60000);
  return getUnixTime(time);
}

/**
 * Create a cookie object.
 * @param {*} cookie
 */
function createCookie(cookie) {
  return {
    name: cookie.name,
    value: cookie.value,
    options: {
      domain: `${cookie.domain.trimLeft('.')}`,
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
function login() {
  return cy.task('LoginPuppeteer', {
    username: Cypress.env('AUTH_USERNAME'),
    password: Cypress.env('AUTH_PASSWORD'),
    loginUrl: 'http://localhost:3000/login',
    callbackUrl: 'http://localhost:3000/callback',
  });
}

/**
 * Login with Auth0.
 */
Cypress.Commands.add('loginAuth0', () => {
  cy.session('logged in user', () => {
    login().then(({ cookies, callbackUrl }) => {
      console.log(cookies);
      cookies
        .map(createCookie)
        .forEach((c) => cy.setCookie(c.name, c.value, c.options));

      cy.visit(callbackUrl);
    });
  });
});

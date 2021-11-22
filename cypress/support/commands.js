Cypress.Commands.add('login', () => {
  cy.session('logged in user', () => {
    const optionsSessionToken = {
      method: 'POST',
      url: `${Cypress.env('OKTA_ORG_URL')}/api/v1/authn`,
      body: {
        username: Cypress.env('AUTH_USERNAME'),
        password: Cypress.env('AUTH_PASSWORD'),
        options: {
          warnBeforePasswordExpired: 'true',
        },
      },
    };

    cy.request(optionsSessionToken).then((response) => {
      const sessionToken = response.body.sessionToken;
      const qs = {
        client_id: Cypress.env('OKTA_CLIENT_ID'),
        redirect_uri: Cypress.env('OKTA_REDIRECT_URL'),
        code_challenge_method: 'S256',
        response_mode: 'fragment',
        response_type: 'code',
        scope: ['openid', 'profile', 'email'],
        sessionToken: sessionToken,
      };

      cy.request({
        method: 'GET',
        url: `${Cypress.env('OKTA_ORG_URL')}/oauth2/default/v1/authorize`,
        form: true,
        followRedirect: false,
        qs: qs,
      }).then((responseWithToken) => {
        const redirectUrl = responseWithToken.redirectedToUrl;

        const accessToken = redirectUrl
          .substring(redirectUrl.indexOf('access_token'))
          .split('=')[1]
          .split('&')[0];

        cy.wrap(accessToken).as('accessToken');

        cy.visit(redirectUrl).then(() => {
          cy.visit('/');
        });
      });
    });
  });
});

describe('/', () => {
  it('Shows a landing page', () => {
    cy.visit('/');

    cy.translate('app.service.name').then((serviceName) => {
      cy.get('body').should('contain', serviceName);
    });
  });

  context('when I am logged in', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin');
    });

    it('shows my username', () => {
      cy.translate('app.welcome', { name: 'beis-rpr' }).then(
        (welcomeMessage) => {
          cy.get('body').should('contain', welcomeMessage);
        },
      );
    });
  });
});

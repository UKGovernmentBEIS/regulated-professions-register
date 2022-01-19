describe('/', () => {
  it('Shows a landing page', () => {
    cy.visit('/');

    cy.translate('app.pages.index.heading').then((heading) => {
      cy.get('body').should('contain', heading);
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

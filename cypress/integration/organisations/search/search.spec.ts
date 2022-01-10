describe('Searching an organisation', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.translate('app.startButton').then((startButton) => {
      cy.contains(startButton).click();
    });

    cy.translate('app.pages.selectService.options.findAuthority').then(
      (findAuthorityOption) => {
        cy.get('label').contains(findAuthorityOption).click();
        cy.get('button').click();
      },
    );
  });

  it('The search page loads', () => {
    cy.translate('errors.not-found.heading').then((errorMessage) => {
      cy.get('body').should('not.contain', errorMessage);
    });
  });
});

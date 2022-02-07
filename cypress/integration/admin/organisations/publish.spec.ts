describe('Publishing organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('Allows me to publish a draft organisation', () => {
      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();

      cy.contains('Department for Education')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('organisations.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });
    });
  });
});

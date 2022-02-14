describe('Publishing professions', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('Allows me to publish a draft profession', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Gas Safe Engineer')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('professions.admin.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.translate('professions.form.button.publishNow').then(
        (publishButton) => {
          cy.get('button').contains(publishButton).click();
        },
      );

      cy.translate('professions.admin.publish.confirmation.heading').then(
        (confirmation) => {
          cy.get('html').should('contain', confirmation);
        },
      );

      cy.translate(
        'professions.admin.publish.confirmation.backToDashboard',
      ).then((backToDashboard) => {
        cy.get('a').contains(backToDashboard).click();
      });

      cy.get('tr')
        .contains('Gas Safe Engineer')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('professions.admin.status.live').then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });
  });
});

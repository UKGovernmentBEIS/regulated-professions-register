describe('Publishing a decision dataset', () => {
  context('When I am logged in as an admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visitInternalDashboard();
      cy.translate(
        'app.pages.admin.dashboard.editDecisionDataCentralAdmin',
      ).then((link) => {
        cy.get('a').contains(link).click();
        cy.checkAccessibility();
      });
    });

    it('I can publish a draft decision dataset', () => {
      cy.get('tr')
        .contains('Alternative Law Society')
        .parent()
        .within(() => {
          cy.translate('app.status.draft').then((draft) => {
            cy.contains(draft);
          });
          cy.get('a').contains('View details').click();
        });

      cy.translate('decisions.admin.buttons.publish').then((publishButton) => {
        cy.get('a').contains(publishButton).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.publication.caption').then(
        (publishCaption) => {
          cy.get('body').contains(publishCaption);
        },
      );

      cy.translate('decisions.admin.publication.heading').then((heading) => {
        cy.contains(heading);
      });

      cy.contains('Registered Trademark Attorney');
      cy.contains('Alternative Law Society');
      cy.contains('2020');

      cy.translate('decisions.admin.buttons.publish').then((publishButton) => {
        cy.get('button').contains(publishButton).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.show.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('decisions.admin.publication.confirmation.heading').then(
        (confirmationHeading) => {
          cy.get('body').should('contain', confirmationHeading);
        },
      );

      // Temporary check until we display the status on the "show" page
      cy.visitAndCheckAccessibility('/admin/decisions');

      cy.get('tr')
        .contains('Alternative Law Society')
        .parent()
        .within(() => {
          cy.translate('app.status.live').then((live) => {
            cy.contains(live);
          });
        });
    });
  });
});

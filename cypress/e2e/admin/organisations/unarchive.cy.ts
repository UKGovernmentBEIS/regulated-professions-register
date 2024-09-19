import { format } from 'date-fns';

describe('Unarchiving organisations', () => {
  context('When I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
      cy.visitInternalDashboard();
    });

    it('Allows me to unarchive an archived organisation', () => {
      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();

      cy.contains('Archived organisation')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('app.status.archived').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.translate('organisations.admin.button.unarchive').then(
        (unarchiveButton) => {
          cy.get('a').contains(unarchiveButton).click();
        },
      );

      cy.checkAccessibility();

      cy.translate('organisations.admin.unarchive.caption').then(
        (unarchiveCaption) => {
          cy.get('body').should('contain', unarchiveCaption);
        },
      );

      cy.translate('organisations.admin.unarchive.heading', {
        organisationName: 'Archived organisation',
      }).then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('organisations.admin.button.unarchive').then(
        (buttonText) => {
          cy.get('button').contains(buttonText).click();
        },
      );

      cy.checkAccessibility();

      cy.translate('organisations.admin.unarchive.confirmation.heading').then(
        (confirmation) => {
          cy.get('html').should('contain', confirmation);
        },
      );

      cy.get('h2').should('contain', 'Success');

      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.visitAndCheckAccessibility('/admin/organisations');

      cy.get('tr')
        .contains('Archived organisation')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate(`app.status.draft`).then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });

      cy.visit('/regulatory-authorities/search');
    });
  });
});

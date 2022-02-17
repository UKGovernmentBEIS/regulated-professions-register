import { format } from 'date-fns';

describe('Publishing organisations', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
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

      cy.translate('organisations.admin.button.publish').then(
        (publishButton) => {
          cy.get('button').contains(publishButton).click();
        },
      );

      cy.translate('organisations.admin.publish.confirmation.heading').then(
        (confirmation) => {
          cy.get('html').should('contain', confirmation);
        },
      );

      cy.translate(
        'organisations.admin.publish.confirmation.backToDashboard',
      ).then((backToDashboard) => {
        cy.get('a').contains(backToDashboard).click();
      });

      cy.get('tr')
        .contains('Department for Education')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate(`organisations.status.live`).then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });

      cy.contains('Department for Education')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });
      cy.checkAccessibility();

      cy.get('[data-cy=changed-by-user]').should('contain', 'Editor');
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'dd-MM-yyyy'),
      );
    });
  });
});

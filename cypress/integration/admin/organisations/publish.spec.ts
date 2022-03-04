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
          cy.get('a').contains(publishButton).click();
        },
      );

      cy.checkAccessibility();

      cy.translate('organisations.admin.publish.caption').then(
        (publishCaption) => {
          cy.get('body').contains(publishCaption);
        },
      );

      cy.translate('organisations.admin.publish.heading', {
        organisationName: 'Department for Education',
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('organisations.admin.button.publish').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('organisations.admin.publish.confirmation.heading').then(
        (confirmation) => {
          cy.get('html').should('contain', confirmation);
        },
      );

      cy.translate('organisations.admin.button.edit.live').then(
        (editButton) => {
          cy.get('html').should('contain', editButton);
        },
      );

      cy.get('[data-cy=changed-by-user]').should('contain', 'Editor');
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.visitAndCheckAccessibility('/admin/organisations');

      cy.get('tr')
        .contains('Department for Education')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate(`organisations.status.live`).then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });
  });
});

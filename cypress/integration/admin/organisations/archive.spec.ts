import { format } from 'date-fns';

describe('Archiving organisations', () => {
  context('When I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('Allows me to archive a draft organisation', () => {
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

      cy.translate('organisations.admin.button.archive').then(
        (archiveButton) => {
          cy.get('a').contains(archiveButton).click();
        },
      );

      cy.checkAccessibility();

      cy.translate('organisations.admin.archive.caption').then(
        (archiveCaption) => {
          cy.get('body').contains(archiveCaption);
        },
      );

      cy.translate('organisations.admin.archive.heading', {
        organisationName: 'Department for Education',
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('organisations.admin.button.archive').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('organisations.admin.archive.confirmation.heading').then(
        (confirmation) => {
          cy.get('html').should('contain', confirmation);
        },
      );

      cy.get('[data-cy=actions]').should('not.exist');

      cy.translate('organisations.status.archived').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });
      cy.get('[data-cy=changed-by-user]').should('contain', 'Registrar');
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'dd-MM-yyyy'),
      );

      cy.visitAndCheckAccessibility('/admin/organisations');

      cy.get('tr')
        .contains('Department for Education')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate(`organisations.status.archived`).then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });

    });
  });
});

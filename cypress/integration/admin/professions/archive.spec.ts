import { format } from 'date-fns';

describe('Archiving professions', () => {
  context('When I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('Allows me to archive a draft profession', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Gas Safe Engineer')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('app.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.translate('professions.admin.button.archive').then((button) => {
        cy.get('a').contains(button).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.admin.archive.caption').then((caption) => {
        cy.get('body').contains(caption);
      });

      cy.translate('professions.admin.archive.heading', {
        professionName: 'Gas Safe Engineer',
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('professions.admin.button.archive').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('professions.admin.archive.confirmation.heading').then(
        (confirmation) => {
          cy.get('html').should('contain', confirmation);
        },
      );

      cy.get('[data-cy=actions]').should('not.exist');

      cy.translate('app.status.archived').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });
      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Registrar');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+registrar@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('tr')
        .contains('Gas Safe Engineer')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('app.status.archived').then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });

      cy.visitAndCheckAccessibility('/professions/search');

      cy.get('body').should('not.contain', 'Gas Safe Engineer');
    });

    it('Allows me to archive a live profession', () => {
      cy.get('a').contains('Regulated professions').click();

      cy.contains('Registered Trademark Attorney')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.get('[data-cy=currently-published-version-text]').within(($h2) => {
        cy.translate('professions.admin.publicFacingLink.heading').then(
          (publicFacingLinkHeading) => {
            cy.wrap($h2).should('contain', publicFacingLinkHeading);
          },
        );

        cy.translate('professions.admin.publicFacingLink.label').then(
          (publicFacingLinkLabel) => {
            cy.get('a').should('contain', publicFacingLinkLabel);
          },
        );

        cy.get('a').click();
      });
      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.go('back');

      cy.translate('professions.admin.button.archive').then((button) => {
        cy.get('a').contains(button).click();
      });

      cy.translate('professions.admin.button.archive').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.get('[data-cy=actions]').should('not.exist');

      cy.translate('app.status.archived').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });
      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Registrar');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+registrar@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );
      cy.get('[data-cy=currently-published-version-text]').should('not.exist');

      cy.visit('/admin/professions');

      cy.get('tr')
        .contains('Registered Trademark Attorney')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('app.status.archived').then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });

      cy.visitAndCheckAccessibility('/professions/search');

      cy.get('body').should('not.contain', 'Registered Trademark Attorney');

      cy.visit('/professions/search');

      cy.get('input[name="keywords"]').type('Attorney');

      cy.get('button').click();

      cy.get('body').should('not.contain', 'Registered Trademark Attorney');
    });
  });
});

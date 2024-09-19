import { format } from 'date-fns';

describe('Archiving organisations', () => {
  context('When I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
      cy.visitInternalDashboard();
    });

    describe('Draft organisations', () => {
      it('Allows me to archive a draft organisation with no associated professions', () => {
        cy.get('a').contains('Regulatory authorities').click();
        cy.checkAccessibility();

        cy.contains('Draft Organisation with no professions')
          .parent('tr')
          .within(() => {
            cy.get('a').contains('View details').click();
          });

        cy.translate('app.status.draft').then((status) => {
          cy.get('h2[data-status]').should('contain', status);
        });

        archiveOrganisation('Draft Organisation with no professions');
      });

      it('Shows blocking error when trying to archive a draft organisation with associated professions', () => {
        cy.get('a').contains('Regulatory authorities').click();
        cy.checkAccessibility();

        cy.contains('Department for Education')
          .parent('tr')
          .within(() => {
            cy.get('a').contains('View details').click();
          });

        cy.translate('app.status.draft').then((status) => {
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

        cy.translate('organisations.admin.archive.forbidden').then(
          (message) => {
            cy.contains(message);
          },
        );

        cy.get('ul.govuk-list--bullet').within(() => {
          cy.get('li')
            .should('contain', 'Draft Profession')
            .should('contain', 'Profession with two tier-one Organisations')
            .should('contain', 'Secondary School Teacher');
        });

        cy.translate('organisations.admin.button.backToRegulator').then(
          (buttonText) => {
            cy.get('a').contains(buttonText).click();
          },
        );

        cy.get('h1').should('contain', 'Department for Education');
        cy.checkAccessibility();
      });
    });

    describe('Live organisations', () => {
      it('Allows me to archive a live organisation with no associated professions', () => {
        cy.get('a').contains('Regulatory authorities').click();

        cy.contains('Published organisation with no professions')
          .parent('tr')
          .within(() => {
            cy.get('a').contains('View details').click();
          });

        cy.translate('app.status.live').then((status) => {
          cy.get('h2[data-status]').should('contain', status);
        });

        cy.get('[data-cy=currently-published-version-text]').within(($h2) => {
          cy.translate('organisations.admin.publicFacingLink.heading').then(
            (publicFacingLinkHeading) => {
              cy.wrap($h2).should('contain', publicFacingLinkHeading);
            },
          );

          cy.translate('organisations.admin.publicFacingLink.label').then(
            (publicFacingLinkLabel) => {
              cy.get('a').should('contain', publicFacingLinkLabel);
            },
          );

          cy.get('a').click();
        });
        cy.get('body').should(
          'contain',
          'Published organisation with no professions',
        );
        cy.go('back');

        archiveOrganisation('Published organisation with no professions');
      });

      it('Allows me to archive a live organisation with  only an archived professions', () => {
        cy.get('a').contains('Regulatory authorities').click();

        cy.contains('Published organisation with only an archived profession')
          .parent('tr')
          .within(() => {
            cy.get('a').contains('View details').click();
          });

        cy.translate('app.status.live').then((status) => {
          cy.get('h2[data-status]').should('contain', status);
        });

        archiveOrganisation(
          'Published organisation with only an archived profession',
        );
      });

      it('Shows blocking error when trying to archive a live organisation with associated professions', () => {
        cy.get('a').contains('Regulatory authorities').click();

        cy.contains('Council of Registered Gas Installers')
          .parent('tr')
          .within(() => {
            cy.get('a').contains('View details').click();
          });

        cy.translate('app.status.live').then((status) => {
          cy.get('h2[data-status]').should('contain', status);
        });

        cy.get('[data-cy=currently-published-version-text]').within(($h2) => {
          cy.translate('organisations.admin.publicFacingLink.heading').then(
            (publicFacingLinkHeading) => {
              cy.wrap($h2).should('contain', publicFacingLinkHeading);
            },
          );

          cy.translate('organisations.admin.publicFacingLink.label').then(
            (publicFacingLinkLabel) => {
              cy.get('a').should('contain', publicFacingLinkLabel);
            },
          );

          cy.get('a').click();
        });
        cy.get('body').should(
          'contain',
          'Council of Registered Gas Installers',
        );
        cy.go('back');

        cy.translate('organisations.admin.button.archive').then(
          (archiveButton) => {
            cy.get('a').contains(archiveButton).click();
          },
        );
        cy.translate('organisations.admin.button.backToRegulator').then(
          (buttonText) => {
            cy.get('a').contains(buttonText).click();
          },
        );
        cy.get('h1').should('contain', 'Council of Registered Gas Installers');
        cy.checkAccessibility();
      });
    });
  });
});

function archiveOrganisation(organisation: string): void {
  cy.translate('organisations.admin.button.archive').then((archiveButton) => {
    cy.get('a').contains(archiveButton).click();
  });

  cy.checkAccessibility();

  cy.translate('organisations.admin.archive.caption').then((archiveCaption) => {
    cy.get('body').should('contain', archiveCaption);
  });

  cy.translate('organisations.admin.archive.heading', {
    organisationName: organisation,
  }).then((heading) => {
    cy.get('body').should('contain', heading);
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

  cy.translate('organisations.admin.button.unarchive').then((buttonText) => {
    cy.get('a').contains(buttonText);
  });

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

  cy.visitAndCheckAccessibility('/admin/organisations');

  cy.get('tr')
    .contains(organisation)
    .then(($header) => {
      const $row = $header.parent();

      cy.translate(`app.status.archived`).then((status) => {
        cy.wrap($row).should('contain', status);
      });
    });

  cy.visit('/regulatory-authorities/search');

  cy.get('body').should('not.contain', organisation);
}

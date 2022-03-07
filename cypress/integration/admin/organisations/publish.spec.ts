import { format } from 'date-fns';

describe('Publishing organisations', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('Allows me to publish a draft organisation from the organisation page', () => {
      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();

      cy.contains('Draft Organisation')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('organisations.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.get('[data-cy=changed-by-text]').should('not.exist');
      cy.get('[data-cy=currently-published-version-text]').should('not.exist');

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
        organisationName: 'Draft Organisation',
      }).then((heading) => {
        cy.contains(heading);
      });

      // Testing back link goes where we expect
      cy.translate('app.back').then((backLink) => {
        cy.get('a').contains(backLink).click();
      });
      cy.checkAccessibility();
      cy.get('h1').should('contain', 'Draft Organisation');

      cy.translate('organisations.admin.button.publish').then(
        (publishButton) => {
          cy.get('[data-cy=publish-button]').contains(publishButton).click();
        },
      );

      cy.checkAccessibility();
      cy.translate('organisations.admin.button.publish').then(
        (publishButton) => {
          cy.get('[data-cy=publish-button]').contains(publishButton).click();
        },
      );

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

      cy.translate('organisations.headings.changed.by').then(
        (changedByText) => {
          cy.get('[data-cy=changed-by-text]').should('contain', changedByText);
        },
      );
      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Editor');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+editor@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

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
      cy.get('body').should('contain', 'Draft Organisation');
      cy.go('back');

      cy.visitAndCheckAccessibility('/admin/organisations');

      cy.get('tr')
        .contains('Draft Organisation')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate(`organisations.status.live`).then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });

    it('Allows me to publish a draft organisation from the check your answers page', () => {
      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();

      cy.contains('Draft Organisation')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('organisations.admin.button.edit.live').then(
        (editButton) => {
          cy.get('button').contains(editButton).click();
          cy.checkAccessibility();
        },
      );

      cy.get('input[name="email"]').invoke('val', '').type('foo@example.com');
      cy.get('input[name="telephone"]').invoke('val', '').type('1234');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkAccessibility();

      cy.checkSummaryListRowValue(
        'organisations.label.email',
        'foo@example.com',
      );
      cy.checkSummaryListRowValue('organisations.label.telephone', '1234');

      cy.translate('organisations.admin.button.publish').then(
        (publishButton) => {
          cy.get('a').contains(publishButton).click();
        },
      );

      // Testing back link goes where we expect
      cy.translate('app.back').then((backLink) => {
        cy.get('a').contains(backLink).click();
      });
      cy.translate('organisations.admin.edit.heading', {
        organisationName: 'Draft Organisation',
      }).then((editHeading) => {
        cy.get('body').should('contain', editHeading);
      });
      cy.checkAccessibility();
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.translate('organisations.admin.button.publish').then(
        (publishButton) => {
          cy.get('a').contains(publishButton).click();
        },
      );

      cy.translate('organisations.admin.publish.caption').then(
        (publishCaption) => {
          cy.get('body').contains(publishCaption);
        },
      );

      cy.translate('organisations.admin.publish.heading', {
        organisationName: 'Draft Organisation',
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

      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Editor');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+editor@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.visitAndCheckAccessibility('/admin/organisations');

      cy.get('tr')
        .contains('Draft Organisation')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate(`organisations.status.live`).then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });
  });
});

import { format } from 'date-fns';

describe('Publishing organisations', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('Allows me to publish an existing draft organisation from the organisation page', () => {
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

      // Testing back link goes where we expect
      cy.translate('app.back').then((backLink) => {
        cy.get('a').contains(backLink).click();
      });
      cy.checkAccessibility();
      cy.get('h1').should('contain', 'Department for Education');

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

    it('Allows me to publish an existing draft organisation from the check your answers page', () => {
      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();

      cy.contains('Department for Education')
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
        organisationName: 'Department for Education',
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

  context('when I am logged in as a registrar', () => {
    describe('publishing a brand new profession', () => {
      beforeEach(() => {
        cy.loginAuth0('registrar');
        cy.visitAndCheckAccessibility('/admin');
      });
      it('allows me to create and publish a brand new organisation from the check your answers page', () => {
        cy.get('a').contains('Regulatory authorities').click();
        cy.checkAccessibility();

        cy.translate('organisations.admin.index.add.button').then(
          (buttonText) => {
            cy.get('button').contains(buttonText).click();
          },
        );

        cy.translate('organisations.admin.create.heading').then((heading) => {
          cy.get('html').should('contain', heading);
        });

        cy.get('input[name="name"]').invoke('val', 'New Organisation');

        cy.get('input[name="alternateName"]').type('Alternate Name');

        cy.get('input[name="url"]').type('http://example.com');

        cy.get('textarea[name="address"]').type('123 Fake Street');

        cy.get('input[name="email"]').type('foo@example.com');
        cy.get('input[name="telephone"]').type('1234');

        cy.translate('app.continue').then((buttonText) => {
          cy.get('button').contains(buttonText).click();
        });

        cy.checkSummaryListRowValue(
          'organisations.label.name',
          'New Organisation',
        );
        cy.checkSummaryListRowValue(
          'organisations.label.alternateName',
          'Alternate Name',
        );
        cy.checkSummaryListRowValue(
          'organisations.label.url',
          'http://example.com',
        );
        cy.checkSummaryListRowValue(
          'organisations.label.address',
          '123 Fake Street',
        );
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

        cy.translate('organisations.admin.publish.caption').then(
          (publishCaption) => {
            cy.get('body').contains(publishCaption);
          },
        );

        cy.translate('organisations.admin.publish.heading', {
          organisationName: 'New Organisation',
        }).then((heading) => {
          cy.contains(heading);
        });

        cy.translate('organisations.admin.button.publish').then(
          (buttonText) => {
            cy.get('button').contains(buttonText).click();
          },
        );

        cy.checkAccessibility();

        cy.translate('organisations.admin.publish.confirmation.heading').then(
          (confirmation) => {
            cy.get('html').should('contain', confirmation);
          },
        );

        cy.translate('organisations.admin.publish.confirmation.body', {
          name: 'New Organisation',
        }).then((confirmationBody) => {
          cy.get('html').should('contain.html', confirmationBody);
        });

        cy.get('body').should('contain', 'New Organisation');

        cy.translate(`organisations.status.live`).then((status) => {
          cy.get('h2[data-status]').should('contain', status);
        });

        cy.get('[data-cy=changed-by-user]').should('contain', 'Registrar');
        cy.get('[data-cy=last-modified]').should(
          'contain',
          format(new Date(), 'd MMM yyyy'),
        );

        cy.visitAndCheckAccessibility('/regulatory-authorities/search');
        cy.get('a').contains('New Organisation').click();
        cy.get('h1').should('contain', 'New Organisation');
      });
    });
  });
});

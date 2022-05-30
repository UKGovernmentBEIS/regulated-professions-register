import { format } from 'date-fns';

describe('Editing organisations', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitInternalDashboard();

      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();

      cy.readFile('./seeds/test/organisations.json').then((organisations) => {
        const organisation = organisations[0];
        const version = organisation.versions[1];

        cy.wrap({
          ...organisation,
          ...version,
        }).as('organisation');

        cy.contains(organisation.name)
          .parent('tr')
          .within(() => {
            cy.get('a').contains('View details').click();
          });
        cy.checkAccessibility({ 'link-name': { enabled: false } });

        cy.translate('organisations.admin.button.edit.draft').then(
          (editButton) => {
            cy.get('button').contains(editButton).click();
            cy.checkAccessibility();
          },
        );
      });
    });

    it('Renders the form successfully', () => {
      cy.get('@organisation').then((organisation: any) => {
        cy.translate('organisations.admin.edit.heading', {
          organisationName: organisation.name,
        }).then((editHeading) => {
          cy.get('body').should('contain', editHeading);

          cy.checkInputValue(
            'organisations.admin.form.label.alternateName',
            organisation.alternateName,
          );

          cy.checkInputValue(
            'organisations.admin.form.label.url',
            organisation.url,
          );

          cy.checkTextareaValue(
            'organisations.admin.form.label.address',
            organisation.address,
          );

          cy.checkInputValue(
            'organisations.admin.form.label.email',
            organisation.email,
          );

          cy.checkInputValue(
            'organisations.admin.form.label.telephone',
            organisation.telephone,
          );
        });
      });
    });

    it('Shows errors when I input data incorrectly', () => {
      cy.get('input[name="url"]').invoke('val', '').type('this is not a url');

      cy.get('textarea[name="address"]').clear();
      cy.get('input[name="telephone"]').clear();

      cy.get('input[name="email"]')
        .invoke('val', '')
        .type('this is not an email');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkAccessibility();

      cy.translate('organisations.admin.form.errors.address.empty').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.translate('organisations.admin.form.errors.phone.empty').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.translate('organisations.admin.form.errors.url.invalid').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );
    });

    it('Shows errors when I input data that is too long', () => {
      cy.get('input[name="alternateName"]').invoke('val', 'a'.repeat(501));
      cy.get('input[name="url"]').invoke(
        'val',
        `http://example.com?data=${'a'.repeat(1001)}`,
      );
      cy.get('textarea[name="address"]').invoke('val', 'a'.repeat(501));

      cy.get('input[name="email"]').type('foo@example.com');
      cy.get('input[name="telephone"]').type('020 7215 5000');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('organisations.admin.form.errors.alternateName.long').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.translate('organisations.admin.form.errors.url.long').then((error) => {
        cy.get('body').should('contain', error);
      });

      cy.translate('organisations.admin.form.errors.address.long').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );
    });

    it('Corrects mis-formatted data', () => {
      cy.get('input[name="url"]')
        .invoke('val', '')
        .type('example.com/missing-protocol');

      cy.get('input[name="email"]')
        .invoke('val', '')
        .type('   padded-address@example.com');

      cy.get('input[name="telephone"]')
        .invoke('val', '')
        .type('020    7215 5000');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkAccessibility();

      cy.checkSummaryListRowValue(
        'organisations.label.url',
        'http://example.com/missing-protocol',
      );

      cy.checkSummaryListRowValue(
        'organisations.label.email',
        'padded-address@example.com',
      );

      cy.checkSummaryListRowValue(
        'organisations.label.telephone',
        '+44 (0)20 7215 5000',
      );
    });

    it('Allows me to update an organisation', () => {
      cy.get('input[name="alternateName"]')
        .invoke('val', '')
        .type('New Alternate Name');

      cy.get('input[name="url"]').invoke('val', '').type('http://example.com');

      cy.get('textarea[name="address"]')
        .invoke('val', '')
        .type('123 Fake Street');

      cy.get('input[name="email"]').invoke('val', '').type('foo@example.com');
      cy.get('input[name="telephone"]').invoke('val', '').type('020 7215 5000');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkAccessibility();

      cy.checkSummaryListRowValue(
        'organisations.label.alternateName',
        'New Alternate Name',
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
      cy.checkSummaryListRowValue(
        'organisations.label.telephone',
        '+44 (0)20 7215 5000',
      );

      cy.translate('organisations.admin.button.saveAsDraft').then(
        (buttonText) => {
          cy.get('button').contains(buttonText).click();
        },
      );

      cy.checkAccessibility();

      cy.get('@organisation').then((organisation: any) => {
        cy.translate('organisations.admin.edit.confirmation.heading').then(
          (confirmationHeading) => {
            cy.get('html').should('contain', confirmationHeading);
          },
        );

        cy.translate('organisations.admin.edit.confirmation.body', {
          name: organisation.name,
        }).then((confirmationBody) => {
          cy.get('html').should('contain.html', confirmationBody);
        });

        cy.checkSummaryListRowValue(
          'organisations.label.alternateName',
          'New Alternate Name',
        );

        cy.translate('app.status.draft').then((status) => {
          cy.get('h2[data-status]').should('contain', status);
        });

        cy.translate('organisations.headings.changed.by').then(
          (changedByText) => {
            cy.get('[data-cy=changed-by-text]').should(
              'contain',
              changedByText,
            );
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
      });
    });
  });
});

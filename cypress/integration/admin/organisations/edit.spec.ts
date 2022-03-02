import { format } from 'date-fns';

describe('Editing organisations', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin');

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

      cy.get('input[name="email"]')
        .invoke('val', '')
        .type('this is not an email');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkAccessibility();

      cy.translate('organisations.admin.form.errors.email.invalid').then(
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

    it('Corrects mis-formatted data', () => {
      cy.get('input[name="url"]')
        .invoke('val', '')
        .type('example.com/missing-protocol');

      cy.get('input[name="email"]')
        .invoke('val', '')
        .type('   padded-address@example.com');

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
      cy.get('input[name="telephone"]').invoke('val', '').type('1234');

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
      cy.checkSummaryListRowValue('organisations.label.telephone', '1234');

      cy.translate('organisations.admin.button.amend').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

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

        cy.translate(`organisations.status.draft`).then((status) => {
          cy.get('h2[data-status]').should('contain', status);
        });

        cy.get('[data-cy=changed-by-user]').should('contain', 'Editor');
        cy.get('[data-cy=last-modified]').should(
          'contain',
          format(new Date(), 'dd-MM-yyyy'),
        );
      });
    });
  });
});

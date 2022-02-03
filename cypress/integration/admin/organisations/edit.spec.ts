describe('Editing organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
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

        cy.translate('organisations.admin.button.edit').then((editButton) => {
          cy.get('a').contains(editButton).click();
          cy.checkAccessibility();
        });

        cy.translate('organisation-versions.admin.new.heading').then(
          (heading) => {
            cy.get('body').should('contain', heading);

            cy.translate('app.start').then((startButton) => {
              cy.get('button').contains(startButton).click();
            });
          },
        );
      });
    });

    it('Renders the form successfully', () => {
      cy.get('@organisation').then((organisation: any) => {
        cy.translate('organisations.admin.edit.heading').then((editHeading) => {
          cy.get('body').should('contain', editHeading);

          cy.checkInputValue(
            'organisations.admin.form.label.alternateName',
            organisation.alternateName,
          );

          cy.checkInputValue(
            'organisations.admin.form.label.contactUrl',
            organisation.contactUrl,
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
      cy.get('input[name="contactUrl"]')
        .invoke('val', '')
        .type('this is not a url');

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

      cy.translate('organisations.admin.form.errors.contactUrl.invalid').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );
    });

    it('allows me to update an organisation', () => {
      cy.get('input[name="alternateName"]')
        .invoke('val', '')
        .type('New Alternate Name');

      cy.get('input[name="contactUrl"]')
        .invoke('val', '')
        .type('http://example.com');

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
        'organisations.label.contactUrl',
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

        cy.get('tr')
          .contains(organisation.name)
          .then(($header) => {
            const $row = $header.parent();

            cy.wrap($row).should('contain', 'Alternate Name');

            cy.translate(`organisations.status.draft`).then((status) => {
              cy.wrap($row).should('contain', status);
            });
          });
      });
    });
  });
});

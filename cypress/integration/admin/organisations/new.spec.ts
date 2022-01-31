describe('Creating organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin');

      cy.translate('organisations.admin.index.add.button').then(() => {
        cy.get('a').contains('Regulatory authorities').click();
      });

      cy.translate('organisations.admin.index.add.button').then(
        (buttonText) => {
          cy.get('a').contains(buttonText).click();
        },
      );

      cy.translate('app.start').then((startButton) => {
        cy.get('button').contains(startButton).click();
      });
    });

    it('Shows errors when I input data incorrectly', () => {
      cy.get('input[name="name"]').invoke('val', '');

      cy.get('input[name="contactUrl"]')
        .invoke('val', '')
        .type('this is not a url');

      cy.get('input[name="email"]')
        .invoke('val', '')
        .type('this is not an email');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('organisations.admin.form.errors.name.empty').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

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

    it('allows me to create an organisation', () => {
      cy.translate('organisations.admin.create.heading').then((heading) => {
        cy.get('html').should('contain', heading);
      });

      cy.get('input[name="name"]').invoke('val', 'New Organisation');

      cy.get('input[name="alternateName"]').type('Alternate Name');

      cy.get('input[name="url"]').type('http://example.com');
      cy.get('input[name="contactUrl"]').type('http://example.com');

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

      cy.translate('organisations.admin.create.confirmation.heading').then(
        (confirmationText) => {
          cy.get('html').should('contain', confirmationText);
        },
      );

      cy.visit('/admin/organisations');

      cy.get('body').should('contain', 'New Organisation');
    });
  });
});

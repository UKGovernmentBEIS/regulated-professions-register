describe('Editing organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin');

      cy.get('a').contains('Regulatory authorities').click();

      cy.readFile('./seeds/test/organisations.json').then((organisations) => {
        const organisation = organisations[0];

        cy.wrap(organisation).as('organisation');

        cy.contains(organisation.name)
          .parent('tr')
          .within(() => {
            cy.get('a').contains('View details').click();
          });

        cy.translate('organisations.admin.button.edit').then((editButton) => {
          cy.get('a').contains(editButton).click();
        });
      });
    });

    it('Renders the form successfully', () => {
      cy.get('@organisation').then((organisation: any) => {
        cy.translate('organisations.admin.edit.heading').then((editHeading) => {
          cy.get('body').should('contain', editHeading);

          cy.checkInputValue(
            'organisations.admin.form.label.name',
            organisation.name,
          );

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
  });
});

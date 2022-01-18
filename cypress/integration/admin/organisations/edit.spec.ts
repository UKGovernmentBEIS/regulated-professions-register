describe('Showing organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin');
    });

    it('Allows an organisation to be edited', () => {
      cy.get('a').contains('Regulatory authorities').click();

      cy.readFile('./seeds/test/organisations.json').then((organisations) => {
        const organisation = organisations[0];

        cy.contains(organisation.name)
          .parent('tr')
          .within(() => {
            cy.get('a').contains('View details').click();
          })
          .then(() => {
            cy.translate('organisations.admin.button.edit').then(
              (editButton) => {
                cy.get('a').contains(editButton).click();

                cy.translate('organisations.admin.edit.heading').then(
                  (editHeading) => {
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
                  },
                );
              },
            );
          });

        cy.translate('organisations.admin.button.edit').then((editButton) => {
          cy.get('a').contains(editButton).click();
        });
      });
    });
  });
});

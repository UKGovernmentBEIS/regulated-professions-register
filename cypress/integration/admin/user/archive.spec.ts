function createUser(name: string, email: string): void {
  cy.visitAndCheckAccessibility('/admin/users');

  cy.get('button').click();

  cy.translate('users.form.hint.organisation').then((organisationHint) => {
    cy.get('body').should('contain', organisationHint);
  });

  cy.get('input[name="serviceOwner"][value="1"]').check();

  cy.get('button').click();

  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.get('button').click();

  cy.get('input[name="role"][value="editor"]').check();

  cy.get('button').click();
  cy.get('button').click();
}

describe('Archiving a user', () => {
  context('when I am logged in', () => {
    const name = 'Example Name';
    const email = 'organisation@example.com';

    beforeEach(() => {
      cy.loginAuth0();
      createUser(name, email);
    });

    it('I can delete a user', () => {
      cy.visitAndCheckAccessibility('/admin/users');
      cy.contains(`View ${name}`).click();

      cy.translate('users.form.button.archive').then((archiveButton) => {
        cy.contains(archiveButton).click();
      });

      cy.checkAccessibility();
      cy.translate('users.archive.caption').then((caption) => {
        cy.get('body').contains(caption);
      });

      cy.translate('users.archive.heading', {
        email: email,
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('users.form.button.archive').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('users.archive.confirmation.body').then((successMessage) => {
        cy.get('body').should('contain', successMessage);
      });
      cy.get('body').should('not.contain', email);
    });
  });
});

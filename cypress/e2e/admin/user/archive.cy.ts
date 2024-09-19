function createUser(name: string, email: string): void {
  cy.visitAndCheckAccessibility('/admin/users');

  cy.translate('users.form.button.add').then((addLabel) => {
    cy.get('button').contains(addLabel).click();
  });

  cy.translate('users.form.hint.organisation').then((organisationHint) => {
    cy.get('body').should('contain', organisationHint);
  });

  cy.get('input[name="serviceOwner"][value="1"]').check();

  cy.translate('app.continue').then((continueLabel) => {
    cy.get('button').contains(continueLabel).click();
  });

  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.translate('app.continue').then((continueLabel) => {
    cy.get('button').contains(continueLabel).click();
  });

  cy.get('input[name="role"][value="editor"]').check();

  cy.translate('app.continue').then((continueLabel) => {
    cy.get('button').contains(continueLabel).click();
  });
  cy.translate('users.form.button.create').then((createLabel) => {
    cy.get('button').contains(createLabel).click();
  });
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
      cy.get('td').contains(email).siblings().contains('View details').click();

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

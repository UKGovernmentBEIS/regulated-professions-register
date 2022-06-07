describe('Editing a user', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visitAndCheckAccessibility('/admin/users');
      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in', () => {
    beforeEach(() => {
      cy.loginAuth0();
    });

    it('I can edit a user', () => {
      cy.visitAndCheckAccessibility('/admin/users');
      cy.get('td')
        .contains('beis-rpr+editor@dxw.com')
        .siblings()
        .contains('View details')
        .click();

      cy.checkAccessibility();

      cy.contains('Change Organisation').click();
      cy.checkAccessibility();

      cy.translate('users.form.headings.edit', { name: '- Editor' }).then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );

      cy.get('input[name="serviceOwner"][value="0"]').check();

      cy.get('select[name="organisation"]').select('Department for Education');

      cy.clickContinueAndCheckBackLink();

      cy.translate('users.form.label.organisation').then(
        (organisationLabel) => {
          cy.get('dt')
            .contains(organisationLabel)
            .then(($key) => {
              const $row = $key.parent();

              cy.wrap($row).should('contain', 'Department for Education');
            });
        },
      );

      cy.translate('users.form.button.edit').then((editLabel) => {
        cy.get('button').contains(editLabel).click();
      });
      cy.checkAccessibility();

      cy.translate('users.headings.edit.done').then((successMessage) => {
        cy.get('body')
          .should('contain', successMessage)
          .should('contain', 'beis-rpr+editor@dxw.com');
      });
    });
  });
});

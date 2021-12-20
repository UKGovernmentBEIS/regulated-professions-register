describe('Deleting a user', () => {
  context('when I am logged in', () => {
    beforeEach(() => {
      cy.loginAuth0();
    });

    it('I can delete a user', () => {
      cy.visit('/admin/users');
      cy.contains('View Editor').click();

      cy.translate('users.form.button.delete').then((deleteButton) => {
        cy.contains(deleteButton).click();
      });

      cy.get('body').should('not.contain', 'Editor');
    });
  });
});

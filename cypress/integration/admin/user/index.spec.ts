describe('Listing professions', () => {
  context('When I am logged in as a service admin', () => {
    beforeEach(() => {
      cy.loginAuth0();
    });

    it('All users are listed', () => {
      cy.visitAndCheckAccessibility('/admin/users');

      cy.readFile('./seeds/test/users.json').then((users) => {
        users.forEach((user) => {
          cy.get('tbody th').should('contain', user.name);
          cy.get('tbody td').should('contain', user.email);
        });

        cy.get('tbody tr').should('have.length', users.length);
      });
    });
  });

  context('When I am logged in as an organisation admin', () => {
    beforeEach(() => {
      cy.loginAuth0('orgadmin');
    });

    it('Users for the organisation are listed', () => {
      cy.visitAndCheckAccessibility('/admin/users');

      cy.readFile('./seeds/test/users.json').then((users) => {
        const organisationUsers = users.filter(
          (user) => user.organisation === 'Department for Education',
        );

        organisationUsers.forEach((user) => {
          cy.get('tbody th').should('contain', user.name);
          cy.get('tbody td').should('contain', user.email);
        });

        cy.get('tbody tr').should('have.length', organisationUsers.length);
      });
    });
  });
});

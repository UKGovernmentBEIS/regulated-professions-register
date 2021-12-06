describe('Creating a new user', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visit('/admin/user/create-new-user');
      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in', () => {
    beforeEach(() => {
      cy.loginAuth0();
    });

    it('I can add a new user', () => {
      cy.visit('/admin/user/create-new-user');
      cy.get('button').click();

      cy.get('body').should('contain', 'Name');
      cy.get('body').should('contain', 'Email');

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('name@example.com');
      cy.get('button').click();

      cy.get('body').should('contain', 'Example Name');
      cy.get('body').should('contain', 'name@example.com');

      cy.get('button').click();

      cy.get('body')
        .should('contain', 'User added')
        .should('contain', 'name@example.com');
    });

    it('I cannot add a user that already exists', () => {
      cy.visit('/admin/user/create-new-user');
      cy.get('button').click();

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('beis-rpr@dxw.com');
      cy.get('button').click();

      cy.get('body').should(
        'contain',
        'A user with this email address already exists',
      );
    });

    it('I can revise user details from the confirmation page', () => {
      cy.visit('/admin/user/create-new-user');
      cy.get('button').click();

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('name2@example.com');
      cy.get('button').click();

      cy.get('a').contains('Change').click();

      cy.get('input[name="email"]').clear().type('name3@example.com');
      cy.get('button').click();

      cy.get('body').should('contain', 'name3@example.com');
      cy.get('button').click();

      cy.get('body')
        .should('contain', 'User added')
        .should('contain', 'name3@example.com');
    });
  });
});

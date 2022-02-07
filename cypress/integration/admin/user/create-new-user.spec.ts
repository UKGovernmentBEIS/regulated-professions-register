describe('Creating a new user', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visitAndCheckAccessibility('/admin/users/new');
      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in without the correct permissions', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
    });

    it('does not allow me to add a user', () => {
      cy.visitAndCheckAccessibility('/admin');

      cy.translate('users.headings.index').then((userLabel) => {
        cy.get('body').should('not.contain', userLabel);
      });

      cy.visitAndCheckAccessibility('/admin/users/new');

      cy.translate('errors.forbidden.heading').then((errorMessage) => {
        cy.get('body').should('contain', errorMessage);
      });
    });
  });

  context('when I am logged in with the correct permissions', () => {
    beforeEach(() => {
      cy.loginAuth0();
    });

    it('I can add a new user', () => {
      cy.visitAndCheckAccessibility('/admin/users/new');
      cy.get('button').click();

      cy.translate('users.form.label.name').then((nameLabel) => {
        cy.get('body').should('contain', nameLabel);
      });

      cy.translate('users.form.label.email').then((emailLabel) => {
        cy.get('body').should('contain', emailLabel);
      });

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('name@example.com');
      cy.get('button').click();
      cy.checkAccessibility();

      cy.get('input[name="role"][value="registrar"]').check();

      cy.get('button').click();
      cy.checkAccessibility();

      cy.get('body').should('contain', 'Example Name');
      cy.get('body').should('contain', 'name@example.com');
      cy.translate('users.form.label.serviceOwner.yes').then((serviceOwnerLabel) => {
        cy.get('body').should('contain', serviceOwnerLabel);
      });

      cy.translate('users.roles.registrar').then((registrarLabel) => {
        cy.get('body').should('contain', registrarLabel);
      });

      cy.get('button').click();
      cy.checkAccessibility();

      cy.translate('users.headings.done').then((successMessage) => {
        cy.get('body')
          .should('contain', successMessage)
          .should('contain', 'name@example.com');
      });
    });

    it('I cannot add a user that already exists', () => {
      cy.visitAndCheckAccessibility('/admin/users/new');
      cy.get('button').click();

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('beis-rpr@dxw.com');
      cy.get('button').click();

      cy.translate('users.form.errors.email.alreadyExists').then(
        (emailError) => {
          cy.get('body').should('contain', emailError);
        },
      );
    });

    it('I can revise user details from the confirmation page', () => {
      cy.visitAndCheckAccessibility('/admin/users/new');
      cy.get('button').click();
      cy.checkAccessibility();

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('name2@example.com');
      cy.get('button').click();
      cy.checkAccessibility();

      cy.get('input[name="role"][value="editor"]').check();

      cy.get('button').click();
      cy.checkAccessibility();

      cy.get('a[href*="personal-details/edit?change=true"]:first').click();

      cy.get('input[name="email"]').clear().type('name3@example.com');
      cy.get('button').click();
      cy.checkAccessibility();

      cy.get('body').should('contain', 'name3@example.com');

      cy.get('a[href*="permissions/edit?change=true"]').first().click();

      cy.get('input[name="role"][value="administrator"]').check();

      cy.get('button').click();
      cy.checkAccessibility();

      cy.translate('users.roles.editor').then((label) => {
        cy.get('body').should('not.contain', label);
      });

      cy.translate('users.roles.administrator').then((label) => {
        cy.get('body').should('contain', label);
      });

      cy.get('button').click();
      cy.checkAccessibility();

      cy.translate('users.headings.done').then((successMessage) => {
        cy.get('body')
          .should('contain', successMessage)
          .should('contain', 'name3@example.com');
      });
    });
  });
});

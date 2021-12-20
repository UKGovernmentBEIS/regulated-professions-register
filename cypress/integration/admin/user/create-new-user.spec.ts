import { getYear } from 'date-fns/esm';

describe('Creating a new user', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visit('/admin/users/new');
      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in', () => {
    beforeEach(() => {
      cy.loginAuth0();
    });

    it('I can add a new user', () => {
      cy.visit('/admin/users/new');
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

      cy.get('[type="checkbox"]').check('admin');

      cy.get('button').click();

      cy.get('body').should('contain', 'Example Name');
      cy.get('body').should('contain', 'name@example.com');
      cy.translate('users.form.label.admin').then((adminLabel) => {
        cy.get('body').should('contain', adminLabel);
      });

      cy.get('button').click();

      cy.translate('users.headings.done').then((successMessage) => {
        cy.get('body')
          .should('contain', successMessage)
          .should('contain', 'name@example.com');
      });
    });

    it('I cannot add a user that already exists', () => {
      cy.visit('/admin/users/new');
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
      cy.visit('/admin/users/new');
      cy.get('button').click();

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('name2@example.com');
      cy.get('button').click();

      cy.get('[type="checkbox"]').check('admin');

      cy.get('button').click();

      cy.get('a[href*="personal-details/edit?change=true"]:first').click();

      cy.get('input[name="email"]').clear().type('name3@example.com');
      cy.get('button').click();

      cy.get('body').should('contain', 'name3@example.com');

      cy.get('a[href*="roles/edit?change=true"]').click();

      cy.get('[type="checkbox"]').check('editor');
      cy.get('button').click();

      cy.translate('users.form.label.admin').then((adminLabel) => {
        cy.get('body').should('not.contain', adminLabel);
      });

      cy.translate('users.form.label.editor').then((editorLabel) => {
        cy.get('body').should('contain', editorLabel);
      });

      cy.get('button').click();

      cy.translate('users.headings.done').then((successMessage) => {
        cy.get('body')
          .should('contain', successMessage)
          .should('contain', 'name3@example.com');
      });
    });
  });
});

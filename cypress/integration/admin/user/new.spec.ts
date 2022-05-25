describe('Creating a new user', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visitAndCheckAccessibility('/admin/users');
      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in without the correct permissions', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
    });

    it('does not allow me to add a user', () => {
      cy.visitInternalDashboard();

      cy.translate('users.headings.index').then((userLabel) => {
        cy.get('body').should('not.contain', userLabel);
      });
    });
  });

  context('when I am logged in as an admin', () => {
    beforeEach(() => {
      cy.loginAuth0();
    });

    it('I can add a new user', () => {
      cy.visitAndCheckAccessibility('/admin/users');

      cy.translate('users.form.button.add').then((addButton) => {
        cy.get('button').contains(addButton).click();
      });

      cy.checkAccessibility();

      cy.translate('users.form.headings.new', { name: '' }).then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.translate('users.form.hint.organisation').then((organisationHint) => {
        cy.get('body').should('contain', organisationHint);
      });

      cy.get('input[name="serviceOwner"][value="1"]').check();

      cy.clickContinueAndCheckBackLink();

      cy.translate('users.form.label.email').then((emailLabel) => {
        cy.get('body').should('contain', emailLabel);
      });

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('name@example.com');
      cy.clickContinueAndCheckBackLink();

      cy.translate('users.form.headings.new', { name: '- Example Name' }).then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );

      cy.translate(
        'users.roleDescriptions.manageProfessionsAndOrganisations',
      ).then((manageLabel) => {
        cy.get('body').should('contain', manageLabel);
      });

      cy.translate(
        'users.roleDescriptions.editProfessionsAndOrganisations',
      ).then((editLabel) => {
        cy.get('body').should('contain', editLabel);
      });

      cy.get('input[name="role"][value="registrar"]').check();

      cy.clickContinueAndCheckBackLink();

      cy.get('body').should('contain', 'Example Name');
      cy.get('body').should('contain', 'name@example.com');
      cy.translate('users.form.label.serviceOwner.yes').then(
        (serviceOwnerLabel) => {
          cy.get('body').should('contain', serviceOwnerLabel);
        },
      );

      cy.translate('users.roles.registrar').then((registrarLabel) => {
        cy.get('body').should('contain', registrarLabel);
      });

      cy.translate('users.form.label.organisation').then(
        (organisationLabel) => {
          cy.translate('app.change').then((changeLink) => {
            cy.get('dt')
              .contains(organisationLabel)
              .parent()
              .should('contain', changeLink);
          });
        },
      );

      cy.translate('users.form.button.create').then((createLabel) => {
        cy.get('button').contains(createLabel).click();
      });
      cy.checkAccessibility();

      cy.translate('users.headings.new.done').then((successMessage) => {
        cy.get('body')
          .should('contain', successMessage)
          .should('contain', 'name@example.com');
      });
    });

    it('I cannot add a user that already exists', () => {
      cy.visitAndCheckAccessibility('/admin/users');

      cy.translate('users.form.button.add').then((addButton) => {
        cy.get('button').contains(addButton).click();
      });

      cy.get('input[name="serviceOwner"][value="0"]').check();
      cy.get('select[name="organisation"]').select('Department for Education');

      cy.clickContinueAndCheckBackLink();

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('beis-rpr@dxw.com');
      cy.translate('app.continue').then((continueLabel) => {
        cy.get('button').contains(continueLabel).click();
      });

      cy.translate('users.form.errors.email.alreadyExists').then(
        (emailError) => {
          cy.get('body').should('contain', emailError);
        },
      );
    });

    it('I can revise user details from the confirmation page', () => {
      cy.visitAndCheckAccessibility('/admin/users');

      cy.translate('users.form.button.add').then((addButton) => {
        cy.get('button').contains(addButton).click();
      });

      cy.checkAccessibility();

      cy.get('input[name="serviceOwner"][value="0"]').check();
      cy.get('select[name="organisation"]').select('Department for Education');

      cy.clickContinueAndCheckBackLink();

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('name2@example.com');
      cy.clickContinueAndCheckBackLink();

      cy.get('input[name="role"][value="editor"]').check();

      cy.clickContinueAndCheckBackLink();

      cy.get('a[href*="personal-details/edit?source=confirm"]:first').click();

      cy.get('input[name="email"]').clear().type('name3@example.com');
      cy.clickContinueAndCheckBackLink();

      cy.get('body').should('contain', 'name3@example.com');

      cy.get('a[href*="role/edit?source=confirm"]').first().click();

      cy.get('input[name="role"][value="administrator"]').check();

      cy.clickContinueAndCheckBackLink();

      cy.translate('users.roles.editor').then((label) => {
        cy.get('body').should('not.contain', label);
      });

      cy.translate('users.roles.administrator').then((label) => {
        cy.get('body').should('contain', label);
      });

      cy.translate('users.form.button.create').then((createLabel) => {
        cy.get('button').contains(createLabel).click();
      });
      cy.checkAccessibility();

      cy.translate('users.headings.new.done').then((successMessage) => {
        cy.get('body')
          .should('contain', successMessage)
          .should('contain', 'name3@example.com');
      });
    });
  });

  context('when I am logged in as an organisation admin', () => {
    beforeEach(() => {
      cy.loginAuth0('orgadmin');
    });

    it('I can add a new user', () => {
      cy.visitAndCheckAccessibility('/admin/users');

      cy.translate('users.form.button.add').then((addButton) => {
        cy.get('button').contains(addButton).click();
      });

      cy.checkAccessibility();

      cy.translate('users.form.headings.new', { name: '' }).then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('users.form.label.email').then((emailLabel) => {
        cy.get('body').should('contain', emailLabel);
      });

      cy.get('input[name="name"]').type('Example Name');
      cy.get('input[name="email"]').type('organisation@example.com');
      cy.clickContinueAndCheckBackLink();

      cy.translate('users.form.headings.new', { name: '- Example Name' }).then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );

      cy.translate(
        'users.roleDescriptions.manageProfessionsAndOrganisations',
      ).then((manageLabel) => {
        cy.get('body').should('not.contain', manageLabel);
      });

      cy.translate(
        'users.roleDescriptions.manageProfessionsAndOrganisations',
      ).then((manageLabel) => {
        cy.get('body').should('not.contain', manageLabel);
      });

      cy.translate(
        'users.roleDescriptions.editProfessionsAndOwnOrganisation',
      ).then((editLabel) => {
        cy.get('body').should('contain', editLabel);
      });

      cy.get('input[name="role"][value="editor"]').check();

      cy.clickContinueAndCheckBackLink();

      cy.get('body').should('contain', 'Example Name');
      cy.get('body').should('contain', 'organisation@example.com');
      cy.get('body').should('contain', 'Department for Education');

      cy.translate('users.roles.editor').then((registrarLabel) => {
        cy.get('body').should('contain', registrarLabel);
      });

      cy.translate('users.form.label.organisation').then(
        (organisationLabel) => {
          cy.translate('app.change').then((changeLink) => {
            cy.get('dt')
              .contains(organisationLabel)
              .parent()
              .should('not.contain', changeLink);
          });
        },
      );

      cy.translate('users.form.button.create').then((createLabel) => {
        cy.get('button').contains(createLabel).click();
      });
      cy.checkAccessibility();

      cy.translate('users.headings.new.done').then((successMessage) => {
        cy.get('body')
          .should('contain', successMessage)
          .should('contain', 'organisation@example.com');
      });
    });
  });
});

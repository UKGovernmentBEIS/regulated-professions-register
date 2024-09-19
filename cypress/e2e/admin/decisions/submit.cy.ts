describe('Submiting a decision dataset', () => {
  context('When I am logged in as an organisation-level user', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
      cy.visitInternalDashboard();
      cy.translate('app.pages.admin.dashboard.editDecisionDataRegulators').then(
        (link) => {
          cy.get('a').contains(link).click();
          cy.checkAccessibility();
        },
      );
    });

    it('I can submit a draft decision dataset', () => {
      cy.get('tr')
        .contains(
          'Secondary School Teacher in State maintained schools (England)',
        )
        .parent()
        .within(() => {
          cy.translate('app.status.draft').then((draft) => {
            cy.contains(draft);
          });
          cy.get('a').contains('View details').click();
        });

      cy.translate('decisions.admin.buttons.submit').then((submitButton) => {
        cy.get('a').contains(submitButton).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.submission.caption').then(
        (submitCaption) => {
          cy.get('body').contains(submitCaption);
        },
      );

      cy.translate('decisions.admin.submission.heading').then((heading) => {
        cy.contains(heading);
      });

      cy.contains(
        'Secondary School Teacher in State maintained schools (England)',
      );
      cy.contains('2019');

      cy.translate('decisions.admin.buttons.submit').then((submitButton) => {
        cy.get('button').contains(submitButton).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.show.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('decisions.admin.submission.confirmation.heading').then(
        (confirmationHeading) => {
          cy.get('body').should('contain', confirmationHeading);
        },
      );

      // Temporary check until we display the status on the "show" page
      cy.visitAndCheckAccessibility('/admin/decisions');

      cy.get('tr')
        .contains(
          'Secondary School Teacher in State maintained schools (England)',
        )
        .parent()
        .within(() => {
          cy.translate('app.status.submitted').then((submitted) => {
            cy.contains(submitted);
            cy.get('a').contains('View details').click();
          });
        });

      cy.checkAccessibility();
      cy.translate('decisions.admin.buttons.submit').then((submit) => {
        cy.get('a').should('not.contain', submit);
      });
    });
  });

  context('When I am logged in as a central admin user', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitInternalDashboard();
      cy.translate(
        'app.pages.admin.dashboard.editDecisionDataCentralAdmin',
      ).then((link) => {
        cy.get('a').contains(link).click();
        cy.checkAccessibility();
      });
    });

    it('I cannot submit a draft decision dataset', () => {
      cy.get('tr')
        .contains('Alternative Law Society')
        .parent()
        .within(() => {
          cy.translate('app.status.draft').then((draft) => {
            cy.contains(draft);
          });
          cy.get('a').contains('View details').click();
        });

      cy.translate('decisions.admin.buttons.submit').then((submit) => {
        cy.get('a').should('not.contain', submit);
      });
    });
  });
});

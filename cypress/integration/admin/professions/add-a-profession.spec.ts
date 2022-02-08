describe('Adding a new profession', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in without the correct permissions', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
    });

    it('does not allow me to add a profession', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.translate('professions.admin.addButtonLabel').then((buttonText) => {
        cy.get('body').should('not.contain', buttonText);
      });
    });
  });

  context('when I am logged in with the correct permissions', () => {
    beforeEach(() => {
      cy.loginAuth0();
    });

    it('I can add a new profession', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.translate('professions.admin.addButtonLabel').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.topLevelInformation').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.add').then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('input[name="name"]').type('Example Profession');
      cy.get('[type="checkbox"]').check('GB-ENG');
      cy.translate('industries.constructionAndEngineering').then(
        (constructionAndEngineering) => {
          cy.contains(constructionAndEngineering).click();
        },
      );
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.regulatoryBody').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.add').then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('select[name="regulatoryBody"]').select(
        'Department for Education',
      );
      cy.get('input[name="mandatoryRegistration"][value="mandatory"]').check();
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.regulatedActivities').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.add').then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('textarea[name="activities"]').type('An example activity');
      cy.get('textarea[name="description"]').type(
        'A description of the regulation',
      );

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      // Conditional radio buttons add an additional `aria-expanded` field,
      // so ignore that rule on this page
      cy.checkAccessibility({ 'aria-allowed-attr': { enabled: false } });
      cy.translate('professions.form.headings.qualificationInformation').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.add').then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('textarea[name="level"]').type('An example Qualification level');
      cy.get(
        'input[name="methodToObtainQualification"][value="others"]',
      ).check();
      cy.get('textarea[name="otherMethodToObtainQualification"]').type(
        'Another method',
      );
      cy.get(
        'input[name="mostCommonPathToObtainQualification"][value="generalSecondaryEducation"]',
      ).check();
      cy.get('input[name="duration"]').type('4.0 Years');
      cy.get(
        'input[name="mandatoryProfessionalExperience"][value="1"]',
      ).check();
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.legislation').then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.translate('professions.form.captions.add').then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('textarea[name="nationalLegislation"]').type(
        'National legislation description',
      );
      cy.get('input[name="link"]').type('www.example-legislation.com');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.checkAnswers').then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.translate('professions.form.captions.add').then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('body').should('contain', 'Example Profession');
      cy.translate('nations.england').then((england) => {
        cy.get('body').should('contain', england);
      });
      cy.get('body').should('contain', 'Construction & Engineering');
      cy.get('body').should('contain', 'Department for Education');
      cy.translate(
        'professions.form.radioButtons.mandatoryRegistration.mandatory',
      ).then((mandatoryRegistration) => {
        cy.get('body').should('contain', mandatoryRegistration);
      });
      cy.get('body').should('contain', 'An example activity');
      cy.get('body').should('contain', 'A description of the regulation');

      cy.get('body').should('contain', 'An example Qualification level');
      cy.get('body').should('contain', 'Another method');
      cy.translate(
        'professions.methodsToObtainQualification.generalSecondaryEducation',
      ).then((method) => {
        cy.get('body').should('contain', method);
      });
      cy.get('body').should('contain', '4.0 Years');
      cy.translate('app.yes').then((yes) => {
        cy.get('body').should('contain', yes);
      });

      cy.get('body').should('contain', 'National legislation description');
      cy.get('body').should('contain', 'www.example-legislation.com');

      cy.translate('professions.form.button.create').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.admin.create.confirmation.heading').then(
        (flashHeading) => {
          cy.translate('professions.admin.create.confirmation.body', {
            name: 'Example Profession',
          }).then((flashBody) => {
            cy.get('body')
              .should('contain', flashHeading)
              .should('contain.html', flashBody)
              .should('contain', 'Example Profession');
          });
        },
      );
    });
  });
});

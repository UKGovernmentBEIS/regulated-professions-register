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

      // Conditional radio buttons add an additional `aria-expanded` field,
      // so ignore that rule on this page
      cy.checkAccessibility({ 'aria-allowed-attr': { enabled: false } });

      cy.translate('professions.form.headings.topLevelInformation').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.add').then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('input[name="name"]').type('Example Profession');

      cy.translate(
        'professions.form.label.topLevelInformation.certainNations',
      ).then((certainNations) => {
        cy.get('label').contains(certainNations).click();
        cy.get('[type="checkbox"]').check('GB-ENG');
      });

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
      cy.get('select[name="additionalRegulatoryBody"]').select(
        'General Medical Council',
      );
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
      cy.get('textarea[name="regulationSummary"]').type(
        'A summary of the regulation',
      );
      cy.get('textarea[name="reservedActivities"]').type('An example activity');
      cy.get('textarea[name="protectedTitles"]').type(
        'An example protected title',
      );
      cy.get('input[name="regulationUrl"]').type(
        'https://example.com/regulation',
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

      cy.checkSummaryListRowValue(
        'professions.form.label.topLevelInformation.name',
        'Example Profession',
      );

      cy.translate('nations.england').then((england) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.topLevelInformation.nations',
          england,
        );
        cy.get('body').should('contain', england);
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.topLevelInformation.industry',
        'Construction & Engineering',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatoryBody.regulatedAuthority',
        'Department for Education',
      );

      cy.translate(
        'professions.form.radioButtons.mandatoryRegistration.mandatory',
      ).then((mandatoryRegistration) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.regulatoryBody.mandatoryRegistration',
          mandatoryRegistration,
        );
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatoryBody.additionalAuthority',
        'General Medical Council',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.regulationSummary',
        'A summary of the regulation',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.reservedActivities',
        'An example activity',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.protectedTitles',
        'An example protected title',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.regulationUrl',
        'https://example.com/regulation',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.qualificationInformation.qualificationLevel',
        'An example Qualification level',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.qualificationInformation.methodsToObtainQualification',
        'Another method',
      );

      cy.translate(
        'professions.methodsToObtainQualification.generalSecondaryEducation',
      ).then((method) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.qualificationInformation.mostCommonPathToObtainQualification',
          method,
        );
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.qualificationInformation.duration',
        '4.0 Years',
      );

      cy.translate('app.yes').then((yes) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.qualificationInformation.mandatoryProfessionalExperience',
          yes,
        );
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'National legislation description',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.link',
        'www.example-legislation.com',
      );

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

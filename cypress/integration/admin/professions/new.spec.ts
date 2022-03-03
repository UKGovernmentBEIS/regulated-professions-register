import { format } from 'date-fns';

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
      cy.loginAuth0('registrar');
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
      cy.get('select[name="regulatoryBody"]').select(
        'Department for Education',
      );
      cy.get('select[name="regulatoryBody"]').should(
        'not.contain',
        'Unconfirmed Organisation',
      );
      cy.get('select[name="additionalRegulatoryBody"]').select(
        'General Medical Council',
      );
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      // Conditional radio buttons add an additional `aria-expanded` field,
      // so ignore that rule on this page
      cy.checkAccessibility({ 'aria-allowed-attr': { enabled: false } });
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.translate('professions.form.label.scope.certainNations').then(
        (certainNations) => {
          cy.get('label').contains(certainNations).click();
          cy.get('[type="checkbox"]').check('GB-ENG');
        },
      );

      cy.translate('industries.constructionAndEngineering').then(
        (constructionAndEngineering) => {
          cy.contains(constructionAndEngineering).click();
        },
      );
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('input[name="registrationRequirements"]').type('Requirements');
      cy.get('input[name="registrationUrl"]').type('this is not a url');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('professions.form.errors.registrationUrl.invalid').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.get('input[name="registrationUrl"]')
        .invoke('val', '')
        .type('https://example.com/requirement');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('professions.form.headings.regulatedActivities').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
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

      cy.checkAccessibility();
      cy.translate('professions.form.headings.qualifications').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('textarea[name="routesToObtain"]').type(
        'General secondary education',
      );
      cy.get('input[name="moreInformationUrl"]').type(
        'http://example.com/more-info',
      );

      cy.get('input[name="ukRecognition"]').type('Recognition in the UK');
      cy.get('input[name="ukRecognitionUrl"]').type('http://example.com/uk');
      cy.get('input[name="otherCountriesRecognition"]').type(
        'Recognition in other countries',
      );
      cy.get('input[name="otherCountriesRecognitionUrl"]').type(
        'http://example.com/other',
      );

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.legislation').then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
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
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.topLevelInformation.name',
        'Example Profession',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.topLevelInformation.regulatedAuthority',
        'Department for Education',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.topLevelInformation.additionalAuthority',
        'General Medical Council',
      );

      cy.translate('nations.england').then((england) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.scope.nations',
          england,
        );
        cy.get('body').should('contain', england);
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.scope.industry',
        'Construction & Engineering',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.registration.registrationRequirements',
        'Requirements',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.registration.registrationUrl',
        'https://example.com/requirement',
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
        'professions.form.label.qualifications.routesToObtain',
        'General secondary education',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.qualifications.moreInformationUrl',
        'http://example.com/more-info',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.qualifications.ukRecognition',
        'Recognition in the UK',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.qualifications.ukRecognitionUrl',
        'http://example.com/uk',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.qualifications.otherCountriesRecognition',
        'Recognition in other countries',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.qualifications.otherCountriesRecognitionUrl',
        'http://example.com/other',
      );

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
      cy.get('[data-cy=changed-by-user]').should('contain', 'Registrar');
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'dd-MM-yyyy'),
      );
    });
  });
});

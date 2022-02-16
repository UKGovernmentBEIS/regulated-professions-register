describe('Editing an existing profession', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visitAndCheckAccessibility('/admin/professions');
      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in with the correct permissions', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
    });

    it('I can edit an existing profession', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('table')
        .contains('tr', 'Registered Trademark Attorney')
        .within(() => {
          cy.contains('View details').click();
        });

      cy.checkAccessibility();
      cy.translate('professions.admin.editProfession').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });

      cy.translate('professions.form.headings.edit', {
        professionName: 'Registered Trademark Attorney',
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('professions.form.button.edit').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.originalAnswers').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.topLevelInformation.name',
        'Registered Trademark Attorney',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatoryBody.regulatedAuthority',
        'Law Society of England and Wales',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.regulationSummary',
        'Registration protection and exploitation of trade marks',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.qualificationInformation.qualificationLevel',
        'DSE - Diploma (post-secondary education), including Annex II (ex 92/51, Annex C,D) , Art. 11 c',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'The Trade Marks Act 1994',
      );

      cy.translate('professions.form.button.saveAsDraft').then((buttonText) => {
        cy.get(buttonText).should('not.exist');
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.topLevelInformation.name',
        'Change',
      );

      // Conditional radio buttons add an additional `aria-expanded` field,
      // so ignore that rule on this page
      cy.checkAccessibility({ 'aria-allowed-attr': { enabled: false } });

      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('input[name="name"]').clear().type('Updated name');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.topLevelInformation.name',
        'Updated name',
      );

      cy.clickSummaryListRowAction(
        'professions.form.label.regulatoryBody.regulatedAuthority',
        'Change',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('select[name="regulatoryBody"]').select(
        'Department for Education',
      );
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.regulatoryBody.regulatedAuthority',
        'Department for Education',
      );

      cy.clickSummaryListRowAction(
        'professions.form.label.regulatedActivities.regulationSummary',
        'Change',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('textarea[name="regulationSummary"]')
        .clear()
        .type('Updated summary of the regulation');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.regulationSummary',
        'Updated summary of the regulation',
      );

      cy.clickSummaryListRowAction(
        'professions.form.label.qualificationInformation.qualificationLevel',
        'Change',
      );
      // Conditional radio buttons add an additional `aria-expanded` field,
      // so ignore that rule on this page
      cy.checkAccessibility({ 'aria-allowed-attr': { enabled: false } });
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('textarea[name="level"]')
        .clear()
        .type('Updated qualification level');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.qualificationInformation.qualificationLevel',
        'Updated qualification level',
      );

      cy.clickSummaryListRowAction(
        'professions.form.label.legislation.nationalLegislation',
        'Change',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('textarea[name="nationalLegislation"]')
        .clear()
        .type('Updated legislation');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'Updated legislation',
      );

      cy.translate('professions.form.button.saveAsDraft').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.admin.update.confirmation.heading').then(
        (flashHeading) => {
          cy.translate('professions.admin.update.confirmation.body', {
            name: 'Updated name',
          }).then((flashBody) => {
            cy.get('body')
              .should('contain', flashHeading)
              .should('contain.html', flashBody)
              .should('contain', 'Updated name');
          });
        },
      );
    });

    it('hides the UK recognition fields if the organisation covers the whole of the UK', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('table')
        .contains('tr', 'Gas Safe Engineer')
        .within(() => {
          cy.contains('View details').click();
        });

      cy.translate('professions.admin.editProfession').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });

      cy.translate('professions.form.button.edit').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.topLevelInformation.nations',
        'Change',
      );

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.get('label').contains(uk).click();
      });

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate(
        'professions.form.label.qualificationInformation.ukRecognition',
      ).then((ukRecognition) => {
        cy.contains('.govuk-summary-list__row', ukRecognition).should(
          'be.visible',
        );
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.qualificationInformation.methodsToObtainQualification',
        'Change',
      );

      cy.translate(
        'professions.form.label.qualificationInformation.ukRecognition',
      ).then((ukRecognition) => {
        cy.get('body').should('not.contain', ukRecognition);
      });

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.topLevelInformation.nations',
        'Change',
      );

      cy.translate(
        'professions.form.label.topLevelInformation.certainNations',
      ).then((certainNations) => {
        cy.get('label').contains(certainNations).click();
      });

      cy.get('[type="checkbox"]').uncheck('GB-SCT');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate(
        'professions.form.label.qualificationInformation.ukRecognition',
      ).then((ukRecognition) => {
        cy.contains('.govuk-summary-list__row', ukRecognition).should(
          'be.visible',
        );
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.qualificationInformation.methodsToObtainQualification',
        'Change',
      );

      cy.translate(
        'professions.form.label.qualificationInformation.ukRecognition',
      ).then((ukRecognition) => {
        cy.get('body').should('contain', ukRecognition);
      });
    });

    it('Selecting UK sets the nations to all UK nations', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('table')
        .contains('tr', 'Gas Safe Engineer')
        .within(() => {
          cy.contains('View details').click();
        });

      cy.checkAccessibility();
      cy.translate('professions.admin.editProfession').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });

      cy.translate('professions.form.button.edit').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.topLevelInformation.name',
        'Change',
      );

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.get('label').contains(uk).click();
      });

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('nations.england').then((england) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.topLevelInformation.nations',
          england,
        );
      });

      cy.translate('nations.wales').then((wales) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.topLevelInformation.nations',
          wales,
        );
      });

      cy.translate('nations.northernIreland').then((northernIreland) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.topLevelInformation.nations',
          northernIreland,
        );
      });

      cy.translate('nations.scotland').then((scotland) => {
        cy.checkSummaryListRowValue(
          'professions.form.label.topLevelInformation.nations',
          scotland,
        );
      });
    });
  });
});

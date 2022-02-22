import { format } from 'date-fns';

describe('Editing an existing profession', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visitAndCheckAccessibility('/admin/professions');
      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
    });

    it('I can edit an all fields of an existing profession except top-level information', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('table')
        .contains('tr', 'Registered Trademark Attorney')
        .within(() => {
          cy.contains('View details').click();
        });

      cy.checkAccessibility();

      cy.translate('professions.admin.changed.by').then((lastUpdatedText) => {
        cy.get('[data-cy=changed-by-text]').should('contain', lastUpdatedText);
      });
      cy.get('[data-cy=changed-by-user]').should('contain', '');

      cy.translate('professions.admin.button.edit.live').then((buttonText) => {
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
        'professions.form.label.topLevelInformation.regulatedAuthority',
        'Law Society of England and Wales',
      );

      cy.translate('nations.england').then((england) => {
        cy.translate('nations.scotland').then((scotland) => {
          cy.translate('nations.wales').then((wales) => {
            cy.translate('nations.northernIreland').then((northernIreland) => {
              cy.checkSummaryListRowList(
                'professions.form.label.scope.nations',
                [england, scotland, wales, northernIreland],
              );
            });
          });
        });
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.regulationSummary',
        'Registration protection and exploitation of trade marks',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.qualifications.qualificationLevel',
        'DSE - Diploma (post-secondary education), including Annex II (ex 92/51, Annex C,D) , Art. 11 c',
      );

      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'The Trade Marks Act 1994',
      );

      cy.translate('professions.form.button.saveAsDraft').then((buttonText) => {
        cy.get(buttonText).should('not.exist');
      });

      cy.translate('professions.form.label.topLevelInformation.name').then(
        (label) => {
          cy.get('dt')
            .contains(label)
            .siblings()
            .should('not.contain', 'Change');
        },
      );

      cy.translate(
        'professions.form.label.topLevelInformation.regulatedAuthority',
      ).then((label) => {
        cy.get('dt').contains(label).siblings().should('not.contain', 'Change');
      });

      cy.translate(
        'professions.form.label.topLevelInformation.additionalAuthority',
      ).then((label) => {
        cy.get('dt').contains(label).siblings().should('not.contain', 'Change');
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.scope.nations',
        'Change',
      );

      // Conditional radio buttons add an additional `aria-expanded` field,
      // so ignore that rule on this page
      cy.checkAccessibility({ 'aria-allowed-attr': { enabled: false } });

      cy.translate('professions.form.label.scope.certainNations').then(
        (certainNations) => {
          cy.get('label').contains(certainNations).click();
        },
      );
      cy.translate('nations.england').then((england) => {
        cy.get('label').contains(england).click();
      });
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('nations.scotland').then((scotland) => {
        cy.translate('nations.wales').then((wales) => {
          cy.translate('nations.northernIreland').then((northernIreland) => {
            cy.checkSummaryListRowList('professions.form.label.scope.nations', [
              scotland,
              wales,
              northernIreland,
            ]);
          });
        });
      });

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
        'professions.form.label.qualifications.qualificationLevel',
        'Change',
      );

      cy.checkAccessibility();
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
        'professions.form.label.qualifications.qualificationLevel',
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
      cy.checkIndexedSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'Updated legislation',
        1,
      );

      cy.clickSummaryListRowAction(
        'professions.form.label.legislation.nationalLegislation',
        'Change',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('textarea[name="secondNationalLegislation"]').type(
        'Second legislation',
      );
      cy.get('input[name="secondLink"]').type(
        'http://www.example.com/legislation',
      );
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkIndexedSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'Updated legislation',
        1,
      );
      cy.checkIndexedSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'Second legislation',
        2,
      );
      cy.checkIndexedSummaryListRowValue(
        'professions.form.label.legislation.link',
        'http://www.example.com/legislation',
        2,
      );

      cy.translate('professions.form.button.saveAsDraft').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.get('[data-cy=changed-by-user]').should('contain', 'Editor');
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'dd-MM-yyyy'),
      );

      cy.translate('professions.admin.update.confirmation.heading').then(
        (flashHeading) => {
          cy.translate('professions.admin.update.confirmation.body', {
            name: 'Registered Trademark Attorney',
          }).then((flashBody) => {
            cy.get('body')
              .should('contain', flashHeading)
              .should('contain.html', flashBody)
              .should('contain', 'Registered Trademark Attorney');
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

      cy.translate('professions.admin.button.edit.draft').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });

      cy.translate('professions.form.button.edit').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.scope.nations',
        'Change',
      );

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.get('label').contains(uk).click();
      });

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('professions.form.label.qualifications.ukRecognition').then(
        (ukRecognition) => {
          cy.contains('.govuk-summary-list__row', ukRecognition).should(
            'be.visible',
          );
        },
      );

      cy.clickSummaryListRowAction(
        'professions.form.label.qualifications.routesToObtain',
        'Change',
      );

      cy.translate('professions.form.label.qualifications.ukRecognition').then(
        (ukRecognition) => {
          cy.get('body').should('not.contain', ukRecognition);
        },
      );

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.scope.nations',
        'Change',
      );

      cy.translate('professions.form.label.scope.certainNations').then(
        (certainNations) => {
          cy.get('label').contains(certainNations).click();
        },
      );

      cy.get('[type="checkbox"]').uncheck('GB-SCT');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('professions.form.label.qualifications.ukRecognition').then(
        (ukRecognition) => {
          cy.contains('.govuk-summary-list__row', ukRecognition).should(
            'be.visible',
          );
        },
      );

      cy.clickSummaryListRowAction(
        'professions.form.label.qualifications.routesToObtain',
        'Change',
      );

      cy.translate('professions.form.label.qualifications.ukRecognition').then(
        (ukRecognition) => {
          cy.get('body').should('contain', ukRecognition);
        },
      );
    });

    it('Selecting UK sets the nations to all UK nations', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('table')
        .contains('tr', 'Gas Safe Engineer')
        .within(() => {
          cy.contains('View details').click();
        });

      cy.checkAccessibility();
      cy.translate('professions.admin.button.edit.draft').then((buttonText) => {
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
        'professions.form.label.scope.nations',
        'Change',
      );

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.get('label').contains(uk).click();
      });

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('nations.england').then((england) => {
        cy.translate('nations.scotland').then((scotland) => {
          cy.translate('nations.wales').then((wales) => {
            cy.translate('nations.northernIreland').then((northernIreland) => {
              cy.checkSummaryListRowList(
                'professions.form.label.scope.nations',
                [england, scotland, wales, northernIreland],
              );
            });
          });
        });
      });
    });

    context('when no Qualification has been set on the Profession', () => {
      it('allows users to update Qualification values', () => {
        cy.visitAndCheckAccessibility('/admin/professions');

        cy.get('table')
          .contains('tr', 'Orthodontic Therapist')
          .within(() => {
            cy.contains('View details').click();
          });

        cy.checkAccessibility();

        cy.translate('professions.form.headings.qualifications').then(
          (qualifications) => {
            cy.get('body').should('not.contain', qualifications);
          },
        );

        cy.translate('professions.admin.button.edit.draft').then(
          (buttonText) => {
            cy.contains(buttonText).click();
          },
        );

        cy.checkAccessibility();

        cy.translate('professions.form.button.edit').then((buttonText) => {
          cy.get('button').contains(buttonText).click();
        });

        cy.checkAccessibility();

        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.routesToObtain',
          '',
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.mostCommonRouteToObtain',
          '',
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.duration',
          '',
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.mandatoryProfessionalExperience',
          '',
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.moreInformationUrl',
          '',
        );

        cy.clickSummaryListRowAction(
          'professions.form.label.qualifications.qualificationLevel',
          'Change',
        );

        cy.checkAccessibility();

        cy.get('textarea[name="routesToObtain"]').type(
          'General secondary education',
        );
        cy.get('textarea[name="mostCommonRouteToObtain"]').type(
          'A 4 year degree',
        );
        cy.get('input[name="duration"]').type('4.0 Years');
        cy.get(
          'input[name="mandatoryProfessionalExperience"][value="1"]',
        ).check();
        cy.get('textarea[name="level"]').type('An example Qualification level');
        cy.get('input[name="moreInformationUrl"]').type(
          'http://example.com/more-info',
        );

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

        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.qualificationLevel',
          'An example Qualification level',
        );

        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.routesToObtain',
          'General secondary education',
        );

        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.mostCommonRouteToObtain',
          'A 4 year degree',
        );

        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.duration',
          '4.0 Years',
        );

        cy.translate('app.yes').then((yes) => {
          cy.checkSummaryListRowValue(
            'professions.form.label.qualifications.mandatoryProfessionalExperience',
            yes,
          );
        });

        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.moreInformationUrl',
          'http://example.com/more-info',
        );

        cy.translate('professions.form.button.saveAsDraft').then(
          (buttonText) => {
            cy.get('button').contains(buttonText).click();
          },
        );

        cy.checkAccessibility();

        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.moreInformationUrl',
          'http://example.com/more-info',
        );
      });
    });
  });

  context('when I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
    });

    it('I edit the top-level information of a profession', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('table')
        .contains(
          'tr',
          'Secondary School Teacher in State maintained schools (England)',
        )
        .within(() => {
          cy.contains('View details').click();
        });

      cy.checkAccessibility();

      cy.translate('professions.admin.changed.by').then((lastUpdatedText) => {
        cy.get('[data-cy=changed-by-text]').should('contain', lastUpdatedText);
      });
      cy.get('[data-cy=changed-by-user]').should('contain', '');

      cy.translate('professions.admin.button.edit.live').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });

      cy.translate('professions.form.headings.edit', {
        professionName:
          'Secondary School Teacher in State maintained schools (England)',
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('professions.form.button.edit').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.topLevelInformation.name',
        'Change',
      );
      cy.checkAccessibility();
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
        'professions.form.label.topLevelInformation.regulatedAuthority',
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
        'professions.form.label.topLevelInformation.regulatedAuthority',
        'Department for Education',
      );

      cy.translate('professions.form.button.saveAsDraft').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.get('[data-cy=changed-by-user]').should('contain', 'Registrar');
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'dd-MM-yyyy'),
      );

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
  });
});

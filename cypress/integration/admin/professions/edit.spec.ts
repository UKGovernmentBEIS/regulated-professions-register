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

      cy.get('[data-cy=changed-by-text]').should('not.exist');

      cy.translate('professions.admin.button.edit.live').then((buttonText) => {
        cy.contains(buttonText).click();
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
        'professions.form.label.organisations.name',
        'Law Society of England and Wales',
      );

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.checkSummaryListRowValue('professions.form.label.scope.nations', uk);
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.regulationSummary',
        'Registration protection and exploitation of trade marks',
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

      cy.translate('professions.form.label.organisations.name').then(
        (label) => {
          cy.get('dt')
            .contains(label)
            .siblings()
            .should('not.contain', 'Change');
        },
      );

      cy.translate('professions.form.label.organisations.name').then(
        (label) => {
          cy.get('dt')
            .contains(label)
            .siblings()
            .should('not.contain', 'Change');
        },
      );

      cy.clickSummaryListRowChangeLink('professions.form.label.scope.nations');

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

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.regulatedActivities.regulationSummary',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit', {
        professionName: 'Registered Trademark Attorney',
      }).then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('textarea[name="regulationSummary"]')
        .clear()
        .type('Updated summary of the regulation');
      cy.get('input[name="regulationType"][value="licensing"]').check();
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.regulationSummary',
        'Updated summary of the regulation',
      );
      cy.translate('professions.regulationTypes.licensing.name').then(
        (licensingText) => {
          cy.checkSummaryListRowValue(
            'professions.form.label.regulatedActivities.regulationType',
            licensingText,
          );
        },
      );

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.qualifications.routesToObtain',
      );

      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit', {
        professionName: 'Registered Trademark Attorney',
      }).then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('textarea[name="routesToObtain"]')
        .clear()
        .type('Updated routes to obtain qualification');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.qualifications.routesToObtain',
        'Updated routes to obtain qualification',
      );

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.legislation.nationalLegislation',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit', {
        professionName: 'Registered Trademark Attorney',
      }).then((editCaption) => {
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

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.legislation.nationalLegislation',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit', {
        professionName: 'Registered Trademark Attorney',
      }).then((editCaption) => {
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
      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'Updated legislation',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.secondNationalLegislation',
        'Second legislation',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.secondLink',
        'http://www.example.com/legislation',
      );

      cy.translate('professions.form.button.saveAsDraft').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.admin.changed.by').then((changedByText) => {
        cy.get('[data-cy=changed-by-text]').should('contain', changedByText);
      });
      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Editor');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+editor@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
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

      cy.clickSummaryListRowChangeLink('professions.form.label.scope.nations');

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.get('label').contains(uk).click();
      });

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('professions.form.label.qualifications.ukRecognition').then(
        (ukRecognition) => {
          cy.get('body').should('not.contain', ukRecognition);
        },
      );

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.qualifications.routesToObtain',
      );

      cy.translate('professions.form.label.qualifications.ukRecognition').then(
        (ukRecognition) => {
          cy.get('body').should('not.contain', ukRecognition);
        },
      );

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowChangeLink('professions.form.label.scope.nations');

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

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.qualifications.routesToObtain',
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

      cy.clickSummaryListRowChangeLink('professions.form.label.scope.nations');

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.get('label').contains(uk).click();
      });

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.checkSummaryListRowValue('professions.form.label.scope.nations', uk);
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

        cy.checkAccessibility({ 'color-contrast': { enabled: false } });

        cy.translate('professions.admin.button.edit.draft').then(
          (buttonText) => {
            cy.contains(buttonText).click();
          },
        );

        cy.checkAccessibility({ 'color-contrast': { enabled: false } });

        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.routesToObtain',
          '',
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.moreInformationUrl',
          '',
        );

        cy.clickSummaryListRowChangeLink(
          'professions.form.label.qualifications.routesToObtain',
        );

        cy.checkAccessibility({ 'color-contrast': { enabled: false } });

        cy.get('textarea[name="routesToObtain"]').type(
          'General secondary education',
        );
        cy.get('input[name="moreInformationUrl"]').type(
          'http://example.com/more-info',
        );

        cy.get('textarea[name="ukRecognition"]').type('Recognition in UK');
        cy.get('input[name="ukRecognitionUrl"]').type('http://example.com/uk');

        cy.get(
          'input[name="otherCountriesRecognitionRoutes"][value="some"]',
        ).check();
        cy.get('textarea[name="otherCountriesRecognitionSummary"]').type(
          'Recognition in other countries',
        );
        cy.get('input[name="otherCountriesRecognitionUrl"]').type(
          'http://example.com/other',
        );

        cy.translate('app.continue').then((buttonText) => {
          cy.get('button').contains(buttonText).click();
        });

        cy.checkAccessibility({ 'color-contrast': { enabled: false } });

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
          'Recognition in UK',
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.ukRecognitionUrl',
          'http://example.com/uk',
        );

        cy.translate(
          'professions.form.label.qualifications.otherCountriesRecognition.some',
          (some: string) => {
            cy.checkSummaryListRowValue(
              'professions.form.label.qualifications.otherCountriesRecognition.routes.label',
              some,
            );
          },
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.otherCountriesRecognition.summary',
          'Recognition in other countries',
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.qualifications.otherCountriesRecognition.url',
          'http://example.com/other',
        );

        cy.translate('professions.form.button.saveAsDraft').then(
          (buttonText) => {
            cy.get('button').contains(buttonText).click();
          },
        );

        cy.checkAccessibility({ 'color-contrast': { enabled: false } });

        cy.checkSummaryListRowValue(
          'professions.show.qualification.moreInformationUrl',
          'http://example.com/more-info',
        );
      });
    });

    context('When the Profession has minimal data', () => {
      it('I can add missing data', () => {
        cy.visitAndCheckAccessibility('/admin/professions');

        cy.get('table')
          .contains('tr', 'Draft Profession')
          .within(() => {
            cy.contains('View details').click();
          });

        cy.checkAccessibility({ 'color-contrast': { enabled: false } });

        cy.translate('professions.admin.button.edit.draft').then(
          (buttonText) => {
            cy.contains(buttonText).click();
          },
        );

        cy.checkAccessibility();

        cy.clickSummaryListRowChangeLink(
          'professions.form.label.legislation.nationalLegislation',
        );
        cy.checkAccessibility();
        cy.translate('professions.form.captions.edit', {
          professionName: 'Draft Profession',
        }).then((editCaption) => {
          cy.get('body').contains(editCaption);
        });
        cy.get('textarea[name="nationalLegislation"]').type(
          'National legislation',
        );
        cy.get('input[name="link"]').type('http://www.example.com/legislation');
        cy.translate('app.continue').then((buttonText) => {
          cy.get('button').contains(buttonText).click();
        });
        cy.checkSummaryListRowValue(
          'professions.form.label.legislation.nationalLegislation',
          'National legislation',
        );
        cy.checkSummaryListRowValue(
          'professions.form.label.legislation.link',
          'http://www.example.com/legislation',
        );
      });
    });
  });

  context('when I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
    });

    it('I can edit the top-level information of a profession', () => {
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

      cy.get('[data-cy=changed-by-text]').should('not.exist');

      cy.translate('professions.admin.button.edit.live').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.topLevelInformation.name',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit', {
        professionName:
          'Secondary School Teacher in State maintained schools (England)',
      }).then((editCaption) => {
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

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.organisations.name',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit', {
        professionName: 'Updated name',
      }).then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('select[id="regulatoryBodies_1"]').select(
        'Department for Education',
      );
      cy.translate('organisations.label.roles.primaryRegulator').then(
        (label) => {
          cy.get('select[id="roles_1"]').select(label);
        },
      );
      cy.translate('professions.form.button.addRegulator').then((label) => {
        cy.get('a').contains(label).click();
      });
      cy.get('select[id="regulatoryBodies_2"]').select(
        'Council of Registered Gas Installers',
      );
      cy.translate('organisations.label.roles.qualifyingBody').then((label) => {
        cy.get('select[id="roles_2"]').select(label);
      });
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkSummaryListRowValueFromSelector(
        '[data-cy=profession-to-organisation-1]',
        'Department for Education',
      );

      cy.translate('organisations.label.roles.primaryRegulator').then(
        (label) => {
          cy.checkSummaryListRowValueFromSelector(
            '[data-cy=profession-to-organisation-1]',
            label,
          );
        },
      );

      cy.checkSummaryListRowValueFromSelector(
        '[data-cy=profession-to-organisation-2]',
        'Council of Registered Gas Installers',
      );

      cy.translate('organisations.label.roles.qualifyingBody').then((label) => {
        cy.checkSummaryListRowValueFromSelector(
          '[data-cy=profession-to-organisation-2]',
          label,
        );
      });

      cy.translate('professions.form.button.saveAsDraft').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.admin.changed.by').then((changedByText) => {
        cy.get('[data-cy=changed-by-text]').should('contain', changedByText);
      });
      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Registrar');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+registrar@dxw.com',
      );

      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.translate('organisations.label.roles.primaryRegulator').then(
        (header) => {
          cy.get('h3').should('contain', header);
          cy.contains(header)
            .parent('.rpr-details__sub-group')
            .should('contain', 'Department for Education');
        },
      );

      cy.translate('organisations.label.roles.qualifyingBody').then(
        (header) => {
          cy.get('h3').should('contain', header);
          cy.contains(header)
            .parent('.rpr-details__sub-group')
            .should('contain', 'Council of Registered Gas Installers');
        },
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

    it('allows me to remove a regulator', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('table')
        .contains('tr', 'Orthodontic Therapist')
        .within(() => {
          cy.contains('View details').click();
        });

      cy.translate('professions.admin.button.edit.draft').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.organisations.name',
      );

      cy.translate('professions.form.button.addRegulator').then((label) => {
        cy.get('a').contains(label).click();
      });
      cy.get('select[id="regulatoryBodies_2"]').select(
        'Council of Registered Gas Installers',
      );
      cy.translate('organisations.label.roles.qualifyingBody').then((label) => {
        cy.get('select[id="roles_2"]').select(label);
      });
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.organisations.name',
      );

      cy.translate('professions.form.button.removeRegulator').then((label) => {
        cy.get('#regulatoryBodies2 a').contains(label).click();
      });

      cy.get('select[id="regulatoryBodies_2"]').should('have.value', '');
      cy.get('select[id="roles_2"]').should('have.value', '');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkSummaryListRowValueFromSelector(
        '[data-cy=profession-to-organisation-1]',
        'General Medical Council',
      );

      cy.translate('organisations.label.roles.primaryRegulator').then(
        (label) => {
          cy.checkSummaryListRowValueFromSelector(
            '[data-cy=profession-to-organisation-1]',
            label,
          );
        },
      );

      cy.get('html').should(
        'not.contain',
        'Council of Registered Gas Installers',
      );
    });
  });

  context('When I am logged in as organisation editor', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
    });

    it('I can edit a profession where I belong to one of its organisations', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('table')
        .contains('tr', 'Profession with two tier-one Organisations')
        .within(() => {
          cy.contains('View details').click();
        });

      cy.checkAccessibility();

      cy.get('[data-cy=changed-by-text]').should('not.exist');

      cy.translate('professions.admin.button.edit.live').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.regulatedActivities.regulationSummary',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit', {
        professionName: 'Profession with two tier-one Organisation',
      }).then((editCaption) => {
        cy.get('body').should('contain', editCaption);
      });
      cy.get('textarea[name="regulationSummary"]')
        .clear()
        .type('Updated regulation summary');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.regulationSummary',
        'Updated regulation summary',
      );

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.legislation.nationalLegislation',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit', {
        professionName: 'Profession with two tier-one Organisation',
      }).then((editCaption) => {
        cy.get('body').should('contain', editCaption);
      });
      cy.get('textarea[name="secondNationalLegislation"]').clear();
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.clickSummaryListRowChangeLink(
        'professions.form.label.legislation.nationalLegislation',
      );
      cy.get('textarea[name="secondNationalLegislation"]').type(
        'Secondary legislation',
      );
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.legislation.secondNationalLegislation',
        'Secondary legislation',
      );

      cy.translate('professions.form.button.saveAsDraft').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.admin.changed.by').then((changedByText) => {
        cy.get('[data-cy=changed-by-text]').should('contain', changedByText);
      });
      cy.get('[data-cy=changed-by-user-name]').should(
        'contain',
        'Organisation Editor',
      );
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+orgeditor@dxw.com',
      );

      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.translate('professions.admin.update.confirmation.heading').then(
        (flashHeading) => {
          cy.translate('professions.admin.update.confirmation.body', {
            name: 'Profession with two tier-one Organisations',
          }).then((flashBody) => {
            cy.get('body')
              .should('contain', flashHeading)
              .should('contain.html', flashBody)
              .should('contain', 'Profession with two tier-one Organisations');
          });
        },
      );
    });
  });
});

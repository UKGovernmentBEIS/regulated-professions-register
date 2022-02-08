describe('Editing an existing profession', () => {
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

    it('does not allow me to edit a profession', () => {
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
        'professions.form.label.regulatedActivities.description',
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

      cy.translate('professions.form.button.publishNow').then((buttonText) => {
        cy.get(buttonText).should('not.exist');
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
        'professions.form.label.regulatedActivities.description',
        'Change',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.edit').then((editCaption) => {
        cy.get('body').contains(editCaption);
      });
      cy.get('textarea[name="description"]')
        .clear()
        .type('Updated description of the regulation');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.description',
        'Updated description of the regulation',
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

      cy.translate('professions.form.button.publishNow').then((buttonText) => {
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
  });
});

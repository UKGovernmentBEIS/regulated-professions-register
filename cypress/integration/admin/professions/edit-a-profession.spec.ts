describe('Editing an existing profession', () => {
  context('when I am not logged in', () => {
    it('I am prompted to log in', () => {
      cy.visit('/admin/professions');
      cy.location('pathname').should('contain', 'login');
    });
  });

  context('when I am logged in without the correct permissions', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
    });

    it('does not allow me to edit a profession', () => {
      cy.visit('/admin/professions');

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
      cy.visit('/admin/professions');

      cy.get('table')
        .contains('tr', 'Registered Trademark Attorney')
        .within(() => {
          cy.contains('View details').click();
        });

      cy.translate('professions.admin.editProfession').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.translate('professions.form.headings.edit', {
        professionName: 'Registered Trademark Attorney',
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('professions.form.button.edit').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

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
    });
  });
});

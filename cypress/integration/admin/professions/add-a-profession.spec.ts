describe('Adding a new profession', () => {
  it('I can add a new profession', () => {
    cy.visit('/admin/professions/add-profession');

    cy.translate('app.start').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });

    cy.translate('professions.form.headings.topLevelInformation').then(
      (heading) => {
        cy.get('body').should('contain', heading);
      },
    );

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

    cy.translate('professions.form.headings.regulatoryBody').then((heading) => {
      cy.get('body').should('contain', heading);
    });
    cy.get('select[name="regulatoryBody"]').select('Department for Education');
    cy.get('input[name="mandatoryRegistration"][value="mandatory"]').check();
    cy.translate('app.continue').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });

    cy.translate('professions.form.headings.regulatedActivities').then(
      (heading) => {
        cy.get('body').should('contain', heading);
      },
    );

    cy.get('textarea[name="activities"]').type('An example activity');
    cy.get('textarea[name="description"]').type(
      'A description of the regulation',
    );

    cy.translate('app.continue').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });

    cy.translate('professions.form.headings.checkAnswers').then((heading) => {
      cy.get('body').should('contain', heading);
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

    cy.translate('professions.form.button.create').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });

    cy.translate('professions.form.headings.confirmation').then((heading) => {
      cy.get('body')
        .should('contain', heading)
        .should('contain', 'Example Profession');
    });
  });
});

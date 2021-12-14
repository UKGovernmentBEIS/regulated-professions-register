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
    // TODO: figure out how to select a single checkbox, as this is currently throwing CORS issues
    cy.get('[type="checkbox"]').check();
    cy.get('select[name="industryId"]').select('Construction & Engineering');

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

    cy.translate('professions.form.button.create').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });

    cy.translate('professions.form.headings.confirmation').then((heading) => {
      cy.get('body')
        .should('contain', heading)
        .should('contain', 'Example Profession');
    });

    cy.visit('/professions/example-profession');
    cy.get('body').should('contain', 'Example Profession');
  });
});

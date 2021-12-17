describe('Searching a profession', () => {
  it('I can view an unfiltered list of profession', () => {
    cy.visit('/professions/search');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });

  it('The search page does not show draft professions', () => {
    cy.visit('/professions/search');

    cy.get('body').should('not.contain', 'Draft Profession');
  });

  it('I can click a profession to be taken to its details page', () => {
    cy.visit('/professions/search');

    cy.get('a')
      .contains(
        'Secondary School Teacher in State maintained schools (England)',
      )
      .click();
    cy.url().should(
      'contain',
      'professions/secondary-school-teacher-in-state-maintained-schools-england',
    );
  });

  it('I can filter by nation', () => {
    cy.visit('/professions/search');

    cy.get('input[name="nations"][value="GB-WLS"]').check();

    cy.get('button').click();

    cy.get('input[name="nations"][value="GB-WLS"]').should('be.checked');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'not.contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });

  it('I can filter by industry', () => {
    cy.visit('/professions/search');

    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.get('button').click();

    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label')
        .contains(nameLabel)
        .parent()
        .find('input')
        .should('be.checked');
    });

    cy.get('body').should(
      'contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
    cy.get('body').should('not.contain', 'Registered Trademark Attorney');
  });

  it('I can filter by keyword', () => {
    cy.visit('/professions/search');

    cy.get('input[name="keywords"]').type('Attorney');

    cy.get('button').click();

    cy.get('input[name="keywords"]').should('have.value', 'Attorney');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'not.contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });
});

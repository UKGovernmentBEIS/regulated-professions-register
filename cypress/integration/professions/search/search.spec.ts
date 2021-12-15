describe('Searching a profession', () => {
  it('I can view an unfiltered list of profession', () => {
    cy.visit('/professions/search');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
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

  it('I can enter search filters', () => {
    cy.visit('/professions/search');

    cy.get('input[name="keywords"]').type('Attorney');
    cy.get('input[name="nations"][value="GB-ENG"]').check();
    cy.get('input[name="nations"][value="GB-NIR"]').check();

    cy.get('input[name="industries"]').eq(0).check();
    cy.get('input[name="industries"]').eq(2).check();

    cy.get('button').click();

    cy.get('input[name="keywords"]').should('have.value', 'Attorney');
    cy.get('input[name="nations"][value="GB-ENG"]').should('be.checked');
    cy.get('input[name="nations"][value="GB-NIR"]').should('be.checked');

    cy.get('input[name="industries"]').eq(0).should('be.checked');
    cy.get('input[name="industries"]').eq(2).should('be.checked');
  });
});

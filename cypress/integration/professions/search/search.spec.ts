describe('Searching a profession', () => {
  beforeEach(() => {
    cy.visitAndCheckAccessibility('/');

    cy.translate('app.pages.index.useThisService.checkProfessions.text').then(
      (linkText) => {
        cy.contains(linkText).click();
      },
    );
    cy.checkAccessibility();
  });

  it('I can view an unfiltered list of live professions', () => {
    cy.translate('professions.search.foundPlural', { count: 2 }).then(
      (foundText) => {
        cy.get('body').should('contain.text', foundText);
      },
    );
    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
    cy.get('body').should('not.contain', 'Gas Safe Engineer');
  });

  it('Organisations are sorted alphabetically', () => {
    cy.get('h2').then((elements) => {
      const names = elements.map((_, element) => element.innerText).toArray();
      cy.wrap(names).should('deep.equal', names.sort());
    });
  });

  it('The search page does not show draft professions', () => {
    cy.get('body').should('not.contain', 'Draft Profession');
  });

  it('I can click a profession to be taken to its details page', () => {
    cy.get('a')
      .contains(
        'Secondary School Teacher in State maintained schools (England)',
      )
      .click();
    cy.checkAccessibility();
    cy.url().should(
      'contain',
      'professions/secondary-school-teacher-in-state-maintained-schools-england',
    );
    cy.get('body').should(
      'contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });

  it('I can filter by nation', () => {
    cy.get('input[name="nations[]"][value="GB-WLS"]').check();

    cy.get('button').click();

    cy.checkAccessibility();
    cy.get('input[name="nations[]"][value="GB-WLS"]').should('be.checked');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'not.contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });

  it('I can filter by industry', () => {
    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.get('button').click();
    cy.checkAccessibility();

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
    cy.get('input[name="keywords"]').type('Attorney');

    cy.get('button').click();
    cy.checkAccessibility();

    cy.get('input[name="keywords"]').should('have.value', 'Attorney');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'not.contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });
});

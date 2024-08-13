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
    cy.checkCorrectNumberOfProfessionsAreShown(['live']);
    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
    cy.get('body').should('not.contain', 'Gas Safe Engineer');
  });

  it('Professions are sorted alphabetically', () => {
    cy.get('a.rpr-listing__profession-title').then((elements) => {
      const names = elements.map((_, element) => element.innerText).toArray();

      cy.wrap(names).should(
        'deep.equal',
        [...names].sort((a: string, b: string) => a.localeCompare(b)),
      );
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

  it('I can filter by keyword', () => {
    cy.get('input[name="keywords"]').type('Attorney');

    cy.translate('professions.search.filter.button').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });
    cy.checkAccessibility();

    cy.get('input[name="keywords"]').should('have.value', 'Attorney');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'not.contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });

  it('The search uses a professions keywords to filter', () => {
    cy.get('input[name="keywords"]').type('Adjudicator');
    cy.translate('professions.search.filter.button').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });
    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'not.contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });

  it('I can filter by nation', () => {
    cy.get('input[name="nations[]"][value="GB-WLS"]').check();
    cy.get('input[name="nations[]"][value="GB-NIR"]').check();

    cy.translate('professions.search.filter.button').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });
    cy.checkAccessibility();

    cy.get('input[name="nations[]"][value="GB-WLS"]').should('be.checked');
    cy.get('input[name="nations[]"][value="GB-NIR"]').should('be.checked');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should('contain', 'Profession with no optional fields');
    cy.get('body').should(
      'not.contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });

  it('I can filter by industry', () => {
    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.translate('professions.search.filter.button').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });
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

  it('I can filter by regulation type', () => {
    cy.translate('professions.regulationTypes.licensing.name').then(
      (nameLabel) => {
        cy.get('label').contains(nameLabel).parent().find('input').check();
      },
    );

    cy.translate('professions.search.filter.button').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });
    cy.checkAccessibility();

    cy.translate('professions.regulationTypes.licensing.name').then(
      (nameLabel) => {
        cy.get('label')
          .contains(nameLabel)
          .parent()
          .find('input')
          .should('be.checked');
      },
    );

    cy.get('body').should(
      'contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
    cy.get('body').should('not.contain', 'Registered Trademark Attorney');
  });

  it('I can use the back button to go back to my search results', () => {
    cy.get('input[name="keywords"]').type('Education');

    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.get('input[name="nations[]"][value="GB-ENG"]').check();

    cy.translate('professions.search.filter.button').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });

    cy.get('a')
      .contains(
        'Secondary School Teacher in State maintained schools (England)',
      )
      .click();

    cy.translate('app.backToSearch').then((label) => {
      cy.get('[data-cy=back-link]').should('contain', label);
      cy.get('[data-cy=back-link]')
        .invoke('attr', 'href')
        .should(
          'match',
          /professions\/search\?keywords=Education&industries%5B%5D=.+&nations%5B%5D=GB-ENG/,
        );
    });
  });

  it('I can clear all filters', () => {
    cy.get('input[name="nations[]"][value="GB-WLS"]').check();

    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.get('input[name="keywords"]').type('Attorney');

    cy.translate('professions.search.filter.button').then((buttonText) => {
      cy.get('button').contains(buttonText).click();
    });
    cy.checkAccessibility();

    cy.translate('app.filters.clearAllButton').then((clearAllButton) => {
      cy.get('a').contains(clearAllButton).click();
    });
    cy.checkAccessibility();

    cy.get('input[name="keywords"]').should('not.have.value', 'Attorney');

    cy.get('input[name="nations[]"][value="GB-WLS"]').should('not.be.checked');

    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label')
        .contains(nameLabel)
        .parent()
        .find('input')
        .should('not.be.checked');
    });

    cy.checkCorrectNumberOfProfessionsAreShown(['live']);
  });
});

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
    cy.readFile('./seeds/test/professions.json').then((professions) => {
      const professionsToShow = professions.filter((profession) =>
        profession.versions.some((version) =>
          ['live'].includes(version.status),
        ),
      );

      cy.translate('professions.search.foundPlural', {
        count: professionsToShow.length,
      }).then((foundText) => {
        cy.get('body').should('contain.text', foundText);
      });
      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
      cy.get('body').should('not.contain', 'Gas Safe Engineer');
    });
  });

  it('Professions are sorted alphabetically', () => {
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

  it('The search uses a professions keywords to filter', () => {
    cy.get('input[name="keywords"]').type('Adjudicator');
    cy.get('button').click();
    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should(
      'not.contain',
      'Secondary School Teacher in State maintained schools (England)',
    );
  });

  it('I can go back to my search query', () => {
    cy.get('input[name="keywords"]').type('Teacher');

    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.get('input[name="nations[]"][value="GB-ENG"]').check();

    cy.get('button').click();

    checkResultLength(1);

    cy.get('a')
      .contains(
        'Secondary School Teacher in State maintained schools (England)',
      )
      .click();

    cy.translate('app.back').then((backLabel) => {
      cy.get('a').contains(backLabel).click();
    });

    checkResultLength(1);

    cy.get('input[name="keywords"]').should('have.value', 'Teacher');

    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label')
        .contains(nameLabel)
        .parent()
        .within(() => {
          cy.get('input[name="industries[]"]').should('be.checked');
        });
    });

    cy.translate('nations.england').then((nameLabel) => {
      cy.get('label')
        .contains(nameLabel)
        .parent()
        .within(() => {
          cy.get('input[name="nations[]"]').should('be.checked');
        });
    });
  });
});

function checkResultLength(expectedLength: number): void {
  cy.get('.govuk-grid-column-two-thirds')
    .find('h2')
    .should('have.length', expectedLength);
}

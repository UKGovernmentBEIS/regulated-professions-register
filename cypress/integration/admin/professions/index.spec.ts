describe('Listing professions', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin/professions');

      cy.translate('professions.admin.showFilters').then((showFilters) => {
        cy.get('span').contains(showFilters).click();
      });
    });

    it('I can view an unfiltered list of profession', () => {
      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('Professions are sorted alphabetically', () => {
      cy.get('tbody tr th').then((elements) => {
        const names = elements.map((_, element) => element.innerText).toArray();
        cy.wrap(names).should('deep.equal', names.sort());
      });
    });

    it('The list page does not show draft professions', () => {
      cy.get('body').should('not.contain', 'Draft Profession');
    });

    it('The list page contains the expected columns', () => {
      cy.translate('professions.admin.tableHeading.organisation').then(
        (organisation) => {
          cy.get('tr').eq(0).should('contain', organisation);
        },
      );

      cy.translate('professions.admin.tableHeading.industry').then(
        (industry) => {
          cy.get('tr').eq(0).should('contain', industry);
        },
      );

      cy.translate('professions.admin.tableHeading.changedBy').then(
        (changedBy) => {
          cy.get('tr').eq(0).should('not.contain', changedBy);
        },
      );
    });

    it('I can click a profession to be taken to its details page', () => {
      cy.get('tr')
        .contains(
          'Secondary School Teacher in State maintained schools (England)',
        )
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.url().should(
        'contain',
        'professions/secondary-school-teacher-in-state-maintained-schools-england',
      );
    });

    it('I can filter by keyword', () => {
      cy.get('input[name="keywords"]').type('Attorney');

      clickFilterButton();

      cy.get('input[name="keywords"]').should('have.value', 'Attorney');

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('I can filter by nation', () => {
      cy.get('input[name="nations[]"][value="GB-WLS"]').check();

      clickFilterButton();

      cy.get('input[name="nations[]"][value="GB-WLS"]').should('be.checked');

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('I can filter by organisation', () => {
      cy.get('label')
        .contains('Law Society of England and Wales')
        .parent()
        .find('input')
        .check();

      clickFilterButton();

      cy.get('label')
        .contains('Law Society of England and Wales')
        .parent()
        .find('input')
        .should('be.checked');

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

      clickFilterButton();

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
  });

  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visit('/admin/professions');

      cy.translate('professions.admin.showFilters').then((showFilters) => {
        cy.get('span').contains(showFilters).click();
      });
    });

    it('The list page contains the expected columns', () => {
      cy.translate('professions.admin.tableHeading.regulators').then(
        (regulators) => {
          cy.get('tr').eq(0).should('not.contain', regulators);
        },
      );

      cy.translate('professions.admin.tableHeading.industry').then(
        (industry) => {
          cy.get('tr').eq(0).should('not.contain', industry);
        },
      );

      cy.translate('professions.admin.tableHeading.changedBy').then(
        (changedBy) => {
          cy.get('tr').eq(0).should('contain', changedBy);
        },
      );
    });

    it("The list page is filtered by the user's organisation", () => {
      cy.get('body').should(
        'contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
      cy.get('body').should('not.contain', 'Registered Trademark Attorney');
    });
  });
});

function clickFilterButton(): void {
  cy.translate('professions.admin.form.button.filter').then((buttonLabel) => {
    cy.get('button').contains(buttonLabel).click();
  });
}

describe('Listing professions', () => {
  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin/professions');
    });

    it('I can view an unfiltered list of draft, live and archived Professions', () => {
      cy.checkCorrectNumberOfProfessionsAreShown(['draft', 'live', 'archived']);

      cy.translate('professions.admin.tableHeading.changedBy').then(
        (changedBy) => {
          cy.get('tr').eq(0).should('not.contain', changedBy);
        },
      );

      cy.translate('app.status.live').then((liveText) => {
        cy.translate('app.status.draft').then((draftText) => {
          cy.get('tr')
            .contains('Registered Trademark Attorney')
            .then(($header) => {
              const $row = $header.parent();
              cy.wrap($row).contains(liveText);
            });
          cy.get('tr')
            .contains(
              'Secondary School Teacher in State maintained schools (England)',
            )
            .then(($header) => {
              const $row = $header.parent();
              cy.wrap($row).contains(liveText);
            });
          cy.get('tr')
            .contains('Gas Safe Engineer')
            .then(($header) => {
              const $row = $header.parent();
              cy.wrap($row).contains(draftText);
            });
        });
      });
    });

    it('Professions are sorted alphabetically', () => {
      cy.get('tbody tr th').then((elements) => {
        const names = elements.map((_, element) => element.innerText).toArray();
        cy.wrap(names).should('deep.equal', names.sort());
      });
    });

    it('The list page contains the expected columns', () => {
      cy.translate('professions.admin.tableHeading.changedBy').then(
        (changedBy) => {
          cy.get('tr').eq(0).should('not.contain', changedBy);
        },
      );

      cy.translate('professions.admin.tableHeading.organisation').then(
        (organisation) => {
          cy.get('tr').eq(0).should('contain', organisation);
        },
      );

      cy.translate('professions.admin.tableHeading.nations').then((nations) => {
        cy.get('tr').eq(0).should('contain', nations);
      });

      cy.translate('professions.admin.tableHeading.industry').then(
        (industry) => {
          cy.get('tr').eq(0).should('contain', industry);
        },
      );

      cy.translate('professions.admin.tableHeading.lastModified').then(
        (lastModified) => {
          cy.get('tr').eq(0).should('contain', lastModified);
        },
      );

      cy.translate('professions.admin.tableHeading.status').then((status) => {
        cy.get('tr').eq(0).should('contain', status);
      });
    });

    it('I can filter by keyword', () => {
      expandFilters();

      cy.get('input[name="keywords"]').type('Attorney');

      clickFilterButtonAndCheckAccessibility();

      cy.get('input[name="keywords"]').should('have.value', 'Attorney');

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('I can filter by nation', () => {
      expandFilters();

      cy.get('input[name="nations[]"][value="GB-WLS"]').check();

      clickFilterButtonAndCheckAccessibility();

      cy.get('input[name="nations[]"][value="GB-WLS"]').should('be.checked');

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('I can filter by live, draft and archived organisation', () => {
      expandFilters();

      cy.get('label').should('not.contain', 'Unconfirmed Organisation');

      cy.get('label')
        .contains('Law Society of England and Wales')
        .parent()
        .find('input')
        .check();

      clickFilterButtonAndCheckAccessibility();

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
      expandFilters();

      cy.translate('industries.education').then((nameLabel) => {
        cy.get('label').contains(nameLabel).parent().find('input').check();
      });

      clickFilterButtonAndCheckAccessibility();

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
      expandFilters();

      cy.translate('professions.regulationTypes.certification.name').then(
        (nameLabel) => {
          cy.get('label').contains(nameLabel).parent().find('input').check();
        },
      );

      clickFilterButtonAndCheckAccessibility();

      cy.translate('professions.regulationTypes.certification.name').then(
        (nameLabel) => {
          cy.get('label')
            .contains(nameLabel)
            .parent()
            .find('input')
            .should('be.checked');
        },
      );

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });
  });

  context('When I am logged in as organisation editor', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
      cy.visitAndCheckAccessibility('/admin/professions');

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

      cy.translate('professions.admin.tableHeading.nations').then((nations) => {
        cy.get('tr').eq(0).should('contain', nations);
      });

      cy.translate('professions.admin.tableHeading.industry').then(
        (industry) => {
          cy.get('tr').eq(0).should('contain', industry);
        },
      );

      cy.translate('professions.admin.tableHeading.lastModified').then(
        (lastModified) => {
          cy.get('tr').eq(0).should('contain', lastModified);
        },
      );

      cy.translate('professions.admin.tableHeading.changedBy').then(
        (changedBy) => {
          cy.get('tr').eq(0).should('contain', changedBy);
        },
      );

      cy.translate('professions.admin.tableHeading.status').then((status) => {
        cy.get('tr').eq(0).should('contain', status);
      });
    });

    it("The list page is filtered by the user's organisation", () => {
      cy.get('body').should(
        'contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
      cy.get('body').should('not.contain', 'Registered Trademark Attorney');
      cy.get('body').should('not.contain', 'Draft Profession');
    });
  });

  function clickFilterButtonAndCheckAccessibility(): void {
    cy.translate('professions.admin.filter.button').then((buttonLabel) => {
      cy.get('button').contains(buttonLabel).click();
    });

    cy.checkAccessibility();
  }

  function expandFilters(): void {
    cy.translate('professions.admin.showFilters').then((showFilters) => {
      cy.get('span').contains(showFilters).click();
    });
  }
});

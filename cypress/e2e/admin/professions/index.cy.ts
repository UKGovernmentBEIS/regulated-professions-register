import { parse } from 'date-fns';

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
          cy.get('thead tr').should('not.contain', changedBy);
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
        cy.wrap(names).should(
          'deep.equal',
          [...names].sort((a: string, b: string) => a.localeCompare(b)),
        );
      });
    });

    it('I can sort professions by last updated', () => {
      cy.translate('professions.admin.sort.lastUpdated').then((lastUpdated) => {
        cy.get('a').contains(lastUpdated).click();
        cy.checkAccessibility();
      });

      cy.get('tbody tr td:nth-child(5)').then((elements) => {
        const dates = elements
          .map((_, element) =>
            parse(element.innerText, 'd MMM yyyy', new Date()),
          )
          .toArray();

        cy.wrap(dates).should(
          'deep.equal',
          [...dates].sort((a: Date, b: Date) => b.getTime() - a.getTime()),
        );
      });
    });

    it('I can sort professions by status', () => {
      cy.translate('professions.admin.sort.status').then((status) => {
        cy.get('a').contains(status).click();
        cy.checkAccessibility();
      });

      cy.get('tbody tr td:nth-child(6)').then((elements) => {
        const statuses = elements
          .map((_, element) => element.innerText)
          .toArray();

        cy.translate('app.status.live').then((live) => {
          cy.translate('app.status.draft').then((draft) => {
            cy.translate('app.status.archived').then((archived) => {
              const statusOrder = [draft, live, archived];

              cy.wrap(statuses).should(
                'deep.equal',
                [...statuses].sort(
                  (a: string, b: string) =>
                    statusOrder.indexOf(a) - statusOrder.indexOf(b),
                ),
              );
            });
          });
        });
      });
    });

    it('The list page contains the expected columns', () => {
      cy.translate('professions.admin.tableHeading.changedBy').then(
        (changedBy) => {
          cy.get('thead tr').should('not.contain', changedBy);
        },
      );

      cy.translate('professions.admin.tableHeading.organisation').then(
        (organisation) => {
          cy.get('thead tr').should('contain', organisation);
        },
      );

      cy.translate('professions.admin.tableHeading.nations').then((nations) => {
        cy.get('thead tr').should('contain', nations);
      });

      cy.translate('professions.admin.tableHeading.industry').then(
        (industry) => {
          cy.get('thead tr').should('contain', industry);
        },
      );

      cy.translate('professions.admin.tableHeading.lastModified').then(
        (lastModified) => {
          cy.get('thead tr').should('contain', lastModified);
        },
      );

      cy.translate('professions.admin.tableHeading.status').then((status) => {
        cy.get('thead tr').should('contain', status);
      });
    });

    it('I can filter by keyword', () => {
      cy.expandFilters('professions.admin');

      cy.get('input[name="keywords"]').type('Attorney');

      cy.clickFilterButtonAndCheckAccessibility();

      cy.get('input[name="keywords"]').should('have.value', 'Attorney');

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('I can filter by nation', () => {
      cy.expandFilters('professions.admin');

      cy.get('input[name="nations[]"][value="GB-WLS"]').check();
      cy.get('input[name="nations[]"][value="GB-NIR"]').check();

      cy.clickFilterButtonAndCheckAccessibility();

      cy.get('input[name="nations[]"][value="GB-WLS"]').should('be.checked');
      cy.get('input[name="nations[]"][value="GB-NIR"]').should('be.checked');

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should('contain', 'Profession with no optional fields');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('I can filter by live, draft and archived organisation', () => {
      cy.expandFilters('professions.admin');

      cy.get('label').should('not.contain', 'Unconfirmed Organisation');

      cy.get('label')
        .contains('Law Society of England and Wales')
        .parent()
        .find('input')
        .check();

      cy.clickFilterButtonAndCheckAccessibility();

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
      cy.expandFilters('professions.admin');

      cy.translate('industries.education').then((nameLabel) => {
        cy.get('label').contains(nameLabel).parent().find('input').check();
      });

      cy.clickFilterButtonAndCheckAccessibility();

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
      cy.expandFilters('professions.admin');

      cy.translate('professions.regulationTypes.certification.name').then(
        (nameLabel) => {
          cy.get('label').contains(nameLabel).parent().find('input').check();
        },
      );

      cy.clickFilterButtonAndCheckAccessibility();

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

    it('I can filter then sort the results', () => {
      cy.expandFilters('professions.admin');

      cy.get('input[name="keywords"]').type('Attorney');

      cy.clickFilterButtonAndCheckAccessibility();

      cy.translate('professions.admin.sort.lastUpdated').then((lastUpdated) => {
        cy.get('a').contains(lastUpdated).click();
        cy.checkAccessibility();
      });

      cy.get('tbody tr td:nth-child(5)').then((elements) => {
        const dates = elements
          .map((_, element) =>
            parse(element.innerText, 'd MMM yyyy', new Date()),
          )
          .toArray();

        cy.wrap(dates).should(
          'deep.equal',
          [...dates].sort((a: Date, b: Date) => b.getTime() - a.getTime()),
        );
      });

      cy.get('input[name="keywords"]').should('have.value', 'Attorney');

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('I can sort then filter the results', () => {
      cy.translate('professions.admin.sort.lastUpdated').then((lastUpdated) => {
        cy.get('a').contains(lastUpdated).click();
        cy.checkAccessibility();
      });

      cy.expandFilters('professions.admin');

      cy.get('input[name="keywords"]').type('Attorney');

      cy.clickFilterButtonAndCheckAccessibility();

      cy.get('tbody tr td:nth-child(5)').then((elements) => {
        const dates = elements
          .map((_, element) =>
            parse(element.innerText, 'd MMM yyyy', new Date()),
          )
          .toArray();

        cy.wrap(dates).should(
          'deep.equal',
          [...dates].sort((a: Date, b: Date) => b.getTime() - a.getTime()),
        );
      });

      cy.get('input[name="keywords"]').should('have.value', 'Attorney');

      cy.get('body').should('contain', 'Registered Trademark Attorney');
      cy.get('body').should(
        'not.contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
    });

    it('I can clear all filters and view the original search results', () => {
      cy.expandFilters('professions.admin');

      cy.get('input[name="keywords"]').type('Attorney');

      cy.get('input[name="nations[]"][value="GB-WLS"]').check();

      cy.get('label')
        .contains('Law Society of England and Wales')
        .parent()
        .find('input')
        .check();

      cy.translate('industries.education').then((nameLabel) => {
        cy.get('label').contains(nameLabel).parent().find('input').check();
      });

      cy.translate('professions.regulationTypes.certification.name').then(
        (nameLabel) => {
          cy.get('label').contains(nameLabel).parent().find('input').check();
        },
      );

      cy.clickFilterButtonAndCheckAccessibility();

      cy.expandFilters('professions.admin');

      cy.translate('app.filters.clearAllButton').then((clearAllButton) => {
        cy.get('a').contains(clearAllButton).click();
      });
      cy.checkAccessibility();

      cy.get('input[name="keywords"]').should('not.have.value', 'Attorney');

      cy.get('input[name="nations[]"][value="GB-WLS"]').should(
        'not.be.checked',
      );

      cy.get('label')
        .contains('Law Society of England and Wales')
        .parent()
        .find('input')
        .should('not.be.checked');

      cy.translate('industries.education').then((nameLabel) => {
        cy.get('label')
          .contains(nameLabel)
          .parent()
          .find('input')
          .should('not.be.checked');
      });

      cy.translate('professions.regulationTypes.certification.name').then(
        (nameLabel) => {
          cy.get('label')
            .contains(nameLabel)
            .parent()
            .find('input')
            .should('not.be.checked');
        },
      );

      cy.checkCorrectNumberOfProfessionsAreShown(['draft', 'live', 'archived']);
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
          cy.get('thead tr').should('not.contain', regulators);
        },
      );

      cy.translate('professions.admin.tableHeading.nations').then((nations) => {
        cy.get('thead tr').should('contain', nations);
      });

      cy.translate('professions.admin.tableHeading.industry').then(
        (industry) => {
          cy.get('thead tr').should('contain', industry);
        },
      );

      cy.translate('professions.admin.tableHeading.lastModified').then(
        (lastModified) => {
          cy.get('thead tr').should('contain', lastModified);
        },
      );

      cy.translate('professions.admin.tableHeading.changedBy').then(
        (changedBy) => {
          cy.get('thead tr').should('contain', changedBy);
        },
      );

      cy.translate('professions.admin.tableHeading.status').then((status) => {
        cy.get('thead tr').should('contain', status);
      });
    });

    it("The list page is filtered by the user's organisation", () => {
      cy.get('body').should(
        'contain',
        'Secondary School Teacher in State maintained schools (England)',
      );
      cy.get('body').should('contain', 'Draft Profession');
      cy.get('body').should('not.contain', 'Registered Trademark Attorney');
    });
  });
});

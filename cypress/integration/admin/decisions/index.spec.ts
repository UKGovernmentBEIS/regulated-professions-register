import { format } from 'date-fns';

describe('Listing decision datasets', () => {
  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitInternalDashboard();
      cy.translate(
        'app.pages.admin.dashboard.editDecisionDataCentralAdmin',
      ).then((link) => {
        cy.get('a').contains(link).click();
        cy.checkAccessibility();
      });
    });

    it('Lists all decision datasets', () => {
      cy.getDisplayedDatasets().then((datasets) => {
        cy.translate('decisions.admin.dashboard.search.foundPlural', {
          count: datasets.length,
        }).then((foundText) => {
          cy.get('body').should('contain', foundText);
        });

        datasets.forEach((dataset, index) => {
          cy.get('tbody tr')
            .eq(index)
            .then(($row) => {
              cy.wrap($row).should('contain', dataset.profession);
              cy.wrap($row).should('contain', dataset.organisation);
              cy.wrap($row).should('contain', dataset.year.toString());

              cy.get('[data-cy=changed-by-text]').should('not.exist');
              cy.wrap($row).should('contain', format(new Date(), 'd MMM yyyy'));

              cy.translate(`app.status.${dataset.status}`).then((status) => {
                cy.wrap($row).should('contain', status);
              });
            });
        });
      });

      checkCsvDownload(() => true);
    });

    it('I can filter by keyword', () => {
      cy.expandFilters('decisions.admin.dashboard');

      cy.get('input[name="keywords"]').type('Trademark');

      cy.clickFilterButtonAndCheckAccessibility();

      cy.get('tbody tr').each(($tr) => {
        cy.wrap($tr).should('contain', 'Trademark');
      });

      cy.get('tbody tr').should('have.length.at.least', 1);

      checkCsvDownload((dataset) => dataset.profession.includes('Trademark'));
    });

    it('I can filter by organisation', () => {
      cy.expandFilters('decisions.admin.dashboard');

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

      cy.get('tbody tr').each(($tr) => {
        cy.wrap($tr).should('contain', 'Law Society of England and Wales');
      });

      cy.get('tbody tr').should('have.length.at.least', 1);

      checkCsvDownload(
        (dataset) =>
          dataset.organisation === 'Law Society of England and Wales',
      );
    });

    it('I can filter by year', () => {
      cy.expandFilters('decisions.admin.dashboard');

      cy.get('label').contains('2021').parent().find('input').check();

      cy.clickFilterButtonAndCheckAccessibility();

      cy.get('label')
        .contains('2021')
        .parent()
        .find('input')
        .should('be.checked');

      cy.get('tbody tr').each(($tr) => {
        cy.wrap($tr).should('contain', '2021');
      });

      cy.get('tbody tr').should('have.length.at.least', 1);

      checkCsvDownload((dataset) => dataset.year === 2021);
    });

    it('I can filter by status', () => {
      cy.expandFilters('decisions.admin.dashboard');

      cy.translate('app.status.live').then((live) => {
        cy.get('input[name="statuses[]"]')
          .parent()
          .contains(live)
          .parent()
          .find('input')
          .check();

        cy.clickFilterButtonAndCheckAccessibility();

        cy.get('input[name="statuses[]"]')
          .parent()
          .contains(live)
          .parent()
          .find('input')
          .should('be.checked');

        cy.get('tbody tr').each(($tr) => {
          cy.wrap($tr).should('contain', live);
        });

        cy.get('tbody tr').should('have.length.at.least', 1);
      });

      checkCsvDownload((dataset) => dataset.status === 'live');
    });

    it('I can clear all filters', () => {
      cy.expandFilters('decisions.admin.dashboard');

      cy.get('input[name="keywords"]').type('Teacher');

      cy.get('label')
        .contains('Department for Education')
        .parent()
        .find('input')
        .check();

      cy.get('label').contains('2020').parent().find('input').check();

      cy.translate('app.status.draft').then((draft) => {
        cy.get('input[name="statuses[]"]')
          .parent()
          .contains(draft)
          .parent()
          .find('input')
          .check();
      });

      cy.clickFilterButtonAndCheckAccessibility();
      cy.expandFilters('decisions.admin.dashboard');

      cy.translate('app.filters.clearAllButton').then((clearAllButton) => {
        cy.get('a').contains(clearAllButton).click();
      });
      cy.checkAccessibility();
      cy.expandFilters('decisions.admin.dashboard');

      cy.get('input[name="keywords"]').should('have.value', '');

      cy.get('label')
        .contains('Department for Education')
        .parent()
        .find('input')
        .should('not.be.checked');

      cy.translate('app.status.draft').then((draft) => {
        cy.get('input[name="statuses[]"]')
          .parent()
          .contains(draft)
          .parent()
          .find('input')
          .should('not.be.checked');
      });

      cy.getDisplayedDatasets().then((datasets) => {
        cy.translate('decisions.admin.dashboard.search.foundPlural', {
          count: datasets.length,
        }).then((foundText) => {
          cy.get('body').should('contain', foundText);
        });
      });

      checkCsvDownload(() => true);
    });

    it('Shows link to guidance on outcomes and routes', () => {
      cy.translate('decisions.admin.dashboard.guidanceLink').then(
        (guidanceLink) => {
          cy.get('a').contains(guidanceLink).click();
        },
      );
      cy.get('h1').contains('Guidance on decision outcomes and routes');
      cy.get('a')
        .contains('Back')
        .click()
        .url()
        .should('contain', 'admin/decisions');
    });
  });

  context('When I am logged in as organisation editor', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
      cy.visitInternalDashboard();
      cy.translate('app.pages.admin.dashboard.editDecisionDataRegulators').then(
        (link) => {
          cy.get('a').contains(link).click();
          cy.checkAccessibility();
        },
      );
    });

    it('Lists decision datasets for my organisation', () => {
      cy.getDisplayedDatasets().then((datasets) => {
        datasets = datasets.filter(
          (dataset) => dataset.organisation === 'Department for Education',
        );

        cy.translate(
          `decisions.admin.dashboard.search.${
            datasets.length > 1 ? 'foundPlural' : 'foundSingular'
          }`,
          {
            count: datasets.length,
          },
        ).then((foundText) => {
          cy.get('body').should('contain', foundText);
        });

        datasets.forEach((dataset, index) => {
          cy.get('tbody tr')
            .eq(index)
            .then(($row) => {
              cy.wrap($row).should('contain', dataset.profession);
              cy.wrap($row).should('not.contain', dataset.organisation);
              cy.wrap($row).should('contain', dataset.year.toString());

              cy.get('[data-cy=changed-by-text]').should('not.exist');
              cy.wrap($row).should('contain', format(new Date(), 'd MMM yyyy'));

              cy.translate(`app.status.${dataset.status}`).then((status) => {
                cy.wrap($row).should('contain', status);
              });
            });
        });
      });

      checkCsvDownload(
        (dataset) => dataset.organisation === 'Department for Education',
      );
    });

    it('I can filter by professions', () => {
      cy.expandFilters('decisions.admin.dashboard');

      cy.get('label')
        .contains(
          'Secondary School Teacher in State maintained schools (England)',
        )
        .parent()
        .find('input')
        .check();

      cy.clickFilterButtonAndCheckAccessibility();

      cy.get('tbody tr').each(($tr) => {
        cy.wrap($tr).should('contain', 'Secondary School');
      });

      cy.get('tbody tr').each(($tr) => {
        cy.wrap($tr).should('not.contain', 'Primary School');
      });

      cy.get('tbody tr').should('have.length.at.least', 2);

      checkCsvDownload(
        (dataset) =>
          dataset.profession.includes('Secondary School') &&
          !dataset.profession.includes('Primary School'),
      );
    });

    it('Contains the expected columns and filters', () => {
      cy.translate('decisions.admin.dashboard.tableHeading.profession').then(
        (profession) => {
          cy.get('thead tr').should('contain', profession);
        },
      );

      cy.translate('decisions.admin.dashboard.tableHeading.regulator').then(
        (regulator) => {
          cy.get('thead tr').should('not.contain', regulator);
        },
      );

      cy.translate('decisions.admin.dashboard.tableHeading.year').then(
        (year) => {
          cy.get('thead tr').should('contain', year);
        },
      );

      cy.translate('decisions.admin.dashboard.tableHeading.lastModified').then(
        (lastModified) => {
          cy.get('thead tr').should('contain', lastModified);
        },
      );

      cy.translate('decisions.admin.dashboard.tableHeading.status').then(
        (status) => {
          cy.get('thead tr').should('contain', status);
        },
      );

      cy.expandFilters('decisions.admin.dashboard');

      cy.translate('decisions.admin.dashboard.filter.keywords.label').then(
        (keywords) => {
          cy.get('label').should('not.contain', keywords);
        },
      );

      cy.translate('decisions.admin.dashboard.filter.organisations.label').then(
        (organisations) => {
          cy.get('legend').should('not.contain', organisations);
        },
      );
      cy.translate('decisions.admin.dashboard.filter.professions.label').then(
        (professions) => {
          cy.get('legend').should('contain', professions);
        },
      );

      cy.translate('decisions.admin.dashboard.filter.years.label').then(
        (years) => {
          cy.get('legend').should('contain', years);
        },
      );

      cy.translate('decisions.admin.dashboard.filter.statuses.label').then(
        (statuses) => {
          cy.get('legend').should('contain', statuses);
        },
      );
    });
  });
});

function checkCsvDownload(
  filter: (dataset: SeedDecisionDataset) => boolean,
): void {
  cy.translate('decisions.admin.dashboard.download').then((download) => {
    cy.checkCsvDownload(
      download,
      `decisions-${format(new Date(), 'yyyyMMdd')}`,
      filter,
    );
  });
}

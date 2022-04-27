import { format } from 'date-fns';
import { parse } from 'csv-parse/dist/esm/sync';
import path from 'path';

type SeedDecisionDataset = {
  profession: string;
  organisation: string;
  year: number;
  status: string;
  routes: {
    countries: [];
  }[];
};

describe('Listing decision datasets', () => {
  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin/decisions');
    });

    it('Lists all decision datasets', () => {
      cy.readFile('./seeds/test/decision-datasets.json').then(
        (datasets: SeedDecisionDataset[]) => {
          const datasetsToShow = getDisplayedDatasets(datasets);

          cy.translate('decisions.admin.dashboard.search.foundPlural', {
            count: datasetsToShow.length,
          }).then((foundText) => {
            cy.get('body').should('contain', foundText);
          });

          datasetsToShow.forEach((dataset, index) => {
            cy.get('tbody tr')
              .eq(index)
              .then(($row) => {
                cy.wrap($row).should('contain', dataset.profession);
                cy.wrap($row).should('contain', dataset.organisation);
                cy.wrap($row).should('contain', dataset.year.toString());

                cy.get('[data-cy=changed-by-text]').should('not.exist');
                cy.wrap($row).should(
                  'contain',
                  format(new Date(), 'd MMM yyyy'),
                );

                cy.translate(`app.status.${dataset.status}`).then((status) => {
                  cy.wrap($row).should('contain', status);
                });
              });
          });
        },
      );
    });

    it('I can filter by keyword', () => {
      cy.expandFilters('decisions.admin.dashboard');

      cy.get('input[name="keywords"]').type('Trademark');

      cy.clickFilterButtonAndCheckAccessibility();

      cy.get('tbody tr').each(($tr) => {
        cy.wrap($tr).should('contain', 'Trademark');
      });

      cy.get('tbody tr').should('have.length.at.least', 1);
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

      cy.readFile('./seeds/test/decision-datasets.json').then(
        (datasets: SeedDecisionDataset[]) => {
          const datasetsToShow = getDisplayedDatasets(datasets);

          cy.translate('decisions.admin.dashboard.search.foundPlural', {
            count: datasetsToShow.length,
          }).then((foundText) => {
            cy.get('body').should('contain', foundText);
          });
        },
      );
    });

    it('I can download visible decision data', () => {
      cy.translate('decisions.admin.dashboard.download').then((download) => {
        clickDownloadLink(download);
      });

      const filename = path.join(
        Cypress.config('downloadsFolder'),
        'decisions.csv',
      );

      cy.readFile(filename).then((file) => {
        const rows = parse(file);

        cy.readFile('./seeds/test/decision-datasets.json').then(
          (datasets: SeedDecisionDataset[]) => {
            const countries = datasets
              .flatMap((dataset) => dataset.routes)
              .flatMap((route) => route.countries);

            expect(rows).to.have.length(countries.length + 1);
          },
        );
      });
    });
  });

  context('When I am logged in as organisation editor', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
      cy.visitAndCheckAccessibility('/admin/decisions');
    });

    it('Lists decision datasets for my organisation', () => {
      cy.readFile('./seeds/test/decision-datasets.json').then(
        (datasets: SeedDecisionDataset[]) => {
          const datasetsToShow = getDisplayedDatasets(datasets).filter(
            (dataset) => dataset.organisation === 'Department for Education',
          );

          cy.translate(
            `decisions.admin.dashboard.search.${
              datasetsToShow.length > 1 ? 'foundPlural' : 'foundSingular'
            }`,
            {
              count: datasetsToShow.length,
            },
          ).then((foundText) => {
            cy.get('body').should('contain', foundText);
          });

          datasetsToShow.forEach((dataset, index) => {
            cy.get('tbody tr')
              .eq(index)
              .then(($row) => {
                cy.wrap($row).should('contain', dataset.profession);
                cy.wrap($row).should('not.contain', dataset.organisation);
                cy.wrap($row).should('contain', dataset.year.toString());

                cy.get('[data-cy=changed-by-text]').should('not.exist');
                cy.wrap($row).should(
                  'contain',
                  format(new Date(), 'd MMM yyyy'),
                );

                cy.translate(`app.status.${dataset.status}`).then((status) => {
                  cy.wrap($row).should('contain', status);
                });
              });
          });
        },
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
          cy.get('label').should('contain', keywords);
        },
      );

      cy.translate('decisions.admin.dashboard.filter.organisations.label').then(
        (organisations) => {
          cy.get('legend').should('not.contain', organisations);
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

    it('I can download visible decision data', () => {
      cy.translate('decisions.admin.dashboard.download').then((download) => {
        clickDownloadLink(download);
      });

      const filename = path.join(
        Cypress.config('downloadsFolder'),
        'decisions.csv',
      );

      cy.readFile(filename).then((file) => {
        const rows = parse(file);

        cy.readFile('./seeds/test/decision-datasets.json').then(
          (datasets: SeedDecisionDataset[]) => {
            const organisationDatasets = datasets.filter(
              (dataset) => dataset.organisation === 'Department for Education',
            );

            const countries = organisationDatasets
              .flatMap((dataset) => dataset.routes)
              .flatMap((route) => route.countries);

            expect(rows).to.have.length(countries.length + 1);
          },
        );
      });
    });
  });
});

function getDisplayedDatasets(
  datasets: SeedDecisionDataset[],
): SeedDecisionDataset[] {
  const result = datasets.filter((dataset) =>
    ['live', 'draft'].includes(dataset.status),
  );

  result.sort((dataset1, dataset2) => {
    const professionComparison = dataset1.profession.localeCompare(
      dataset2.profession,
    );

    if (professionComparison) {
      return professionComparison;
    }

    const organisationComparison = dataset1.organisation.localeCompare(
      dataset2.organisation,
    );

    if (organisationComparison) {
      return organisationComparison;
    }

    return dataset2.year - dataset1.year;
  });

  return result;
}

function clickDownloadLink(link: string): void {
  // This is a workaround for a Cypress bug to prevent it waiting
  // indefinitely for a new page to load after clicking the download link
  // See https://github.com/cypress-io/cypress/issues/14857
  cy.window()
    .document()
    .then(function (doc) {
      doc.addEventListener('click', () => {
        setTimeout(function () {
          doc.location.reload();
        }, 5000);
      });
    });

  cy.get('body').contains(link).click();
}

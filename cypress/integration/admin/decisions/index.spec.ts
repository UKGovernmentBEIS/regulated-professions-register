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

    it('Lists all decision datasets with their organisation', () => {
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

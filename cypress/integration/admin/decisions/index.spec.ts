import { format } from 'date-fns';

type SeedDecisionDataset = {
  profession: string;
  organisation: string;
  year: number;
  status: string;
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

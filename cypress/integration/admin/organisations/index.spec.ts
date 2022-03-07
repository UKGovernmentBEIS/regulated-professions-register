import { format } from 'date-fns';

describe('Listing organisations', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin');

      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();
    });

    it('Lists all the organisations', () => {
      cy.readFile('./seeds/test/professions.json').then((professions) => {
        cy.readFile('./seeds/test/organisations.json').then((organisations) => {
          let confirmedCount = 0;

          organisations.forEach((organisation) => {
            const latestVersion =
              organisation.versions[organisation.versions.length - 1];

            if (latestVersion.status === 'unconfirmed') {
              cy.get('tr').should('not.contain', organisation.name);
            } else {
              confirmedCount++;

              cy.get('tr')
                .contains(organisation.name)
                .then(($header) => {
                  const $row = $header.parent();

                  cy.wrap($row).should('contain', organisation.name);

                  if (latestVersion.alternateName) {
                    cy.wrap($row).should(
                      'contain',
                      latestVersion.alternateName,
                    );
                  }
                  cy.get('[data-cy=changed-by-text]').should('not.exist');
                  cy.wrap($row).should(
                    'contain',
                    format(new Date(), 'd MMM yyyy'),
                  );

                  cy.translate(
                    `organisations.status.${latestVersion.status}`,
                  ).then((status) => {
                    cy.wrap($row).should('contain', status);
                  });

                  const professionsForOrganisation = professions.filter(
                    (profession: any) =>
                      profession.organisation == organisation.name,
                  );

                  professionsForOrganisation.forEach((profession: any) => {
                    (profession.versions[0].industries || []).forEach(
                      (industry: any) => {
                        cy.translate(industry).then((industry) => {
                          cy.wrap($row).should('contain', industry);
                        });
                      },
                    );
                  });
                });
            }
          });

          cy.translate('organisations.search.foundPlural', {
            count: confirmedCount,
          }).then((foundText) => {
            cy.get('body').should('contain', foundText);
          });
        });
      });
    });

    it('Organisations are sorted alphabetically', () => {
      cy.get('tbody tr th').then((elements) => {
        const names = elements.map((_, element) => element.innerText).toArray();
        cy.wrap(names).should('deep.equal', names.sort());
      });
    });

    it('I can filter by keyword', () => {
      expandFilters();

      cy.get('input[name="keywords"]').type('Medical');

      clickFilterButtonAndCheckAccessibility();

      cy.get('tbody tr').each(($tr) => {
        cy.wrap($tr).should('contain', 'Medical');
      });

      cy.get('tbody tr').should('have.length.at.least', 1);
    });

    it('I can filter by industry', () => {
      expandFilters();

      cy.translate('industries.law').then((lawText) => {
        cy.get('label')
          .contains(lawText)
          .parent()
          .within(() => {
            cy.get('input[name="industries[]"]').check();
          });

        clickFilterButtonAndCheckAccessibility();

        cy.get('label')
          .contains(lawText)
          .parent()
          .within(() => {
            cy.get('input[name="industries[]"]').should('be.checked');
          });

        cy.get('tbody tr').each(($tr) => {
          cy.wrap($tr).should('contain', lawText);
        });

        cy.get('tbody tr').should('have.length.at.least', 1);
      });
    });
  });

  context('When I am logged in as an organisation admin', () => {
    beforeEach(() => {
      cy.loginAuth0('orgadmin');
      cy.visitAndCheckAccessibility('/admin');

      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();
    });

    it("Lists only the user's own organisation", () => {
      cy.get('tbody tr').should('have.length', 1);
      cy.get('tbody tr').should('contain', 'Department for Education');
      cy.get('[data-cy=changed-by-user]').should('contain', '');
      cy.get('tbody tr').should('contain', format(new Date(), 'd MMM yyyy'));
    });
  });

  function clickFilterButtonAndCheckAccessibility(): void {
    cy.translate('organisations.admin.filter.button').then((buttonLabel) => {
      cy.get('button').contains(buttonLabel).click();
    });

    cy.checkAccessibility();
  }

  function expandFilters(): void {
    cy.translate('organisations.admin.showFilters').then((showFilters) => {
      cy.get('span').contains(showFilters).click();
    });
  }
});

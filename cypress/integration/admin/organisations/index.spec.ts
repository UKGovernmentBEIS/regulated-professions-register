describe('Listing organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visitAndCheckAccessibility('/admin');

      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();
    });

    it('Lists all the organisations', () => {
      cy.readFile('./seeds/test/professions.json').then((professions) => {
        cy.readFile('./seeds/test/organisations.json').then((organisations) => {
          organisations.forEach((organisation) => {
            const latestVersion =
              organisation.versions[organisation.versions.length - 1];

            cy.get('tr')
              .contains(organisation.name)
              .then(($header) => {
                const $row = $header.parent();

                cy.wrap($row).should('contain', organisation.name);
                cy.wrap($row).should('contain', latestVersion.alternateName);

                cy.translate(
                  `organisations.status.${latestVersion.status}`,
                ).then((status) => {
                  cy.wrap($row).should('contain', status);
                });

                const professionsForOrganisation = professions.filter(
                  (profession: any) =>
                    profession.organisation == organisation.name &&
                    profession.confirmed,
                );

                professionsForOrganisation.forEach((profession: any) => {
                  profession.industries.forEach((industry: any) => {
                    cy.translate(industry).then((industry) => {
                      cy.wrap($row).should('contain', industry);
                    });
                  });
                });
              });
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

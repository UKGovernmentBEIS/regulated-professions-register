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
          cy.checkCorrectNumberOfOrganisationsAreShown([
            'draft',
            'live',
            'archived',
          ]);

          organisations.forEach((organisation) => {
            const latestVersion =
              organisation.versions[organisation.versions.length - 1];

            if (latestVersion.status === 'unconfirmed') {
              cy.get('tr').should('not.contain', organisation.name);
            } else {
              cy.get('tr')
                .contains(organisation.name)
                .then(($header) => {
                  const $row = $header.parent();

                  cy.wrap($row).should('contain', organisation.name);

                  cy.get('[data-cy=changed-by-text]').should('not.exist');
                  cy.wrap($row).should(
                    'contain',
                    format(new Date(), 'd MMM yyyy'),
                  );

                  cy.translate(`app.status.${latestVersion.status}`).then(
                    (status) => {
                      cy.wrap($row).should('contain', status);
                    },
                  );

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

    it('I can filter by nation', () => {
      expandFilters();

      cy.translate('nations.wales').then((wales) => {
        cy.translate('app.unitedKingdom').then((unitedKingdom) => {
          cy.get('label')
            .contains(wales)
            .parent()
            .within(() => {
              cy.get('input[name="nations[]"]').check();
            });

          clickFilterButtonAndCheckAccessibility();

          cy.get('label')
            .contains(wales)
            .parent()
            .within(() => {
              cy.get('input[name="nations[]"]').should('be.checked');
            });

          cy.get('tbody tr').each(($tr) => {
            cy.wrap($tr).within(() => {
              cy.get('td')
                .eq(0)
                .invoke('text')
                .then((cellText) => {
                  expect(cellText).to.match(
                    new RegExp(`(${wales}|${unitedKingdom})`, 'g'),
                  );
                });
            });
          });

          cy.get('tbody tr').should('have.length.at.least', 1);
        });
      });
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

      it('I can filter by regulation type', () => {
        expandFilters();

        cy.translate('professions.regulationTypes.licensing.name').then(
          (nameLabel) => {
            cy.get('label').contains(nameLabel).parent().find('input').check();
          },
        );

        clickFilterButtonAndCheckAccessibility();

        cy.translate('professions.regulationTypes.licensing.name').then(
          (nameLabel) => {
            cy.get('label')
              .contains(nameLabel)
              .parent()
              .find('input')
              .should('be.checked');
          },
        );

        cy.get('body').should(
          'contain',
          'Council of Registered Gas Installers',
        );
        cy.get('body').should(
          'not.contain',
          'Law Society of England and Wales',
        );
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

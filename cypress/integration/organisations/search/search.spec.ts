describe('Searching an organisation', () => {
  beforeEach(() => {
    cy.visitAndCheckAccessibility('/');

    cy.translate('app.pages.index.useThisService.findContactDetails.text').then(
      (linkText) => {
        cy.contains(linkText).click();
      },
    );
    cy.checkAccessibility;
  });

  it('I can view an unfiltered list of organisations', () => {
    cy.checkCorrectNumberOfOrganisationsAreShown(['live']);
    cy.readFile('./seeds/test/organisations.json').then((organisations) => {
      organisations.forEach((organisation) => {
        const live = organisation.versions.some(
          (version) => version.status === 'live',
        );

        if (live) {
          cy.get('body').should('contain', organisation.name);
        } else {
          cy.get('body').should('not.contain', organisation.name);
        }
      });
    });
  });

  it('Organisations are sorted alphabetically', () => {
    cy.get('h2').then((elements) => {
      const names = elements.map((_, element) => element.innerText).toArray();

      cy.wrap(names).should(
        'deep.equal',
        [...names].sort((a: string, b: string) => a.localeCompare(b)),
      );
    });
  });

  it('I can click an organisation to be taken to its details page', () => {
    cy.get('a').contains('General Medical Council').click();
    cy.checkAccessibility();
    cy.url().should(
      'contain',
      'regulatory-authorities/general-medical-council',
    );
    cy.get('body').should('contain', 'General Medical Council');
  });

  it('I can filter by keyword', () => {
    cy.get('input[name="keywords"]').type('Installers');

    cy.get('button').click();
    cy.checkAccessibility();

    cy.get('input[name="keywords"]').should('have.value', 'Installers');

    cy.get('body').should('contain', 'Council of Registered Gas Installers');
    checkResultLength(1);
  });

  it('I can use the back button to go back to my search results', () => {
    cy.get('input[name="keywords"]').type('Education');

    cy.translate('industries.education').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.get('input[name="nations[]"][value="GB-ENG"]').check();

    cy.get('button').click();

    cy.get('a').contains('Department for Education').click();

    cy.translate('app.backToSearch').then((label) => {
      cy.get('[data-cy=back-link]').should('contain', label);
      cy.get('[data-cy=back-link]')
        .invoke('attr', 'href')
        .should(
          'match',
          /regulatory-authorities\/search\?keywords=Education&industries%5B%5D=.+&nations%5B%5D=GB-ENG/,
        );
    });
  });

  it('I can filter by nation', () => {
    cy.readFile('./seeds/test/professions.json').then((professions) => {
      const scottishProfessions = professions.filter((profession) =>
        profession.versions.some(
          (version) =>
            version.occupationLocations &&
            version.occupationLocations.includes('GB-SCT'),
        ),
      );

      const organisations = scottishProfessions.map(
        (profession) => profession.organisation,
      );

      cy.get('input[name="nations[]"][value="GB-SCT"]').check();

      cy.get('button').click();
      cy.checkAccessibility();

      cy.get('input[name="nations[]"][value="GB-SCT"]').should('be.checked');

      checkResultLength(organisations.length);

      for (const organisation of organisations) {
        cy.get('body').should('contain', organisation);
      }
    });
  });

  it('I can filter by industry', () => {
    cy.readFile('./seeds/test/organisations.json').then((organisations) => {
      const lawOrganisations = organisations.filter(
        (org) => org.name === 'Law Society of England and Wales',
      );
      cy.translate('industries.law').then((nameLabel) => {
        cy.get('label').contains(nameLabel).parent().find('input').check();
      });

      cy.get('button').click();
      cy.checkAccessibility();

      cy.translate('industries.law').then((nameLabel) => {
        cy.get('label')
          .contains(nameLabel)
          .parent()
          .find('input')
          .should('be.checked');
      });

      cy.get('body').should('contain', 'Law Society of England and Wales');
      checkResultLength(lawOrganisations.length);
    });
  });

  it('I can filter by regulation type', () => {
    cy.readFile('./seeds/test/professions.json').then((professions) => {
      const cerificatedProfessions = professions.filter((profession) =>
        profession.versions.some(
          (version) =>
            version.status === 'live' &&
            version.regulationType === 'certification',
        ),
      );

      const organisations = new Set(
        cerificatedProfessions.map((profession) => profession.organisation),
      );

      cy.translate('professions.regulationTypes.certification.name').then(
        (nameLabel) => {
          cy.get('label').contains(nameLabel).parent().find('input').check();
        },
      );

      cy.get('button').click();
      cy.checkAccessibility();

      cy.translate('professions.regulationTypes.certification.name').then(
        (nameLabel) => {
          cy.get('label')
            .contains(nameLabel)
            .parent()
            .find('input')
            .should('be.checked');
        },
      );

      checkResultLength(organisations.size);

      organisations.forEach((organisation) => {
        cy.get('body').should('contain', organisation);
      });
    });
  });

  it('I can clear all filters', () => {
    cy.get('input[name="keywords"]').type('Medical');

    cy.translate('industries.law').then((lawText) => {
      cy.get('label')
        .contains(lawText)
        .parent()
        .within(() => {
          cy.get('input[name="industries[]"]').check();
        });

      cy.translate('nations.wales').then((wales) => {
        cy.get('label')
          .contains(wales)
          .parent()
          .within(() => {
            cy.get('input[name="nations[]"]').check();
          });
      });

      cy.get('button').click();

      cy.translate('app.filters.clearAllButton').then((clearAllButton) => {
        cy.get('a').contains(clearAllButton).click();
      });

      cy.checkAccessibility();

      cy.get('input[name="keywords"]').should('not.have.value', 'Medical');

      cy.translate('nations.wales').then((wales) => {
        cy.get('label')
          .contains(wales)
          .parent()
          .within(() => {
            cy.get('input[name="nations[]"]').should('not.be.checked');
          });
      });

      cy.translate('industries.law').then((lawText) => {
        cy.get('label')
          .contains(lawText)
          .parent()
          .within(() => {
            cy.get('input[name="industries[]"]').should('not.be.checked');
          });
      });

      cy.checkCorrectNumberOfOrganisationsAreShown(['live']);
    });
  });
});

function checkResultLength(expectedLength: number): void {
  cy.get('.govuk-grid-column-two-thirds')
    .find('h2')
    .should('have.length', expectedLength);
}

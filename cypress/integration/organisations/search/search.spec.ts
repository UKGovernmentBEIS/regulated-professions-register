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
    cy.readFile('./seeds/test/organisations.json').then((organisations) => {
      let liveCount = 0;

      organisations.forEach((organisation) => {
        const live = organisation.versions.some(
          (version) => version.status === 'live',
        );

        if (live) {
          liveCount++;
          cy.get('body').should('contain', organisation.name);
        } else {
          cy.get('body').should('not.contain', organisation.name);
        }
      });

      cy.translate('organisations.search.foundPlural', {
        count: liveCount,
      }).then((foundText) => {
        cy.get('body').should('contain.text', foundText);
      });

      checkResultLength(liveCount);
    });
  });

  it('Organisations are sorted alphabetically', () => {
    cy.get('h2').then((elements) => {
      const names = elements.map((_, element) => element.innerText).toArray();
      cy.wrap(names).should('deep.equal', names.sort());
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
});

function checkResultLength(expectedLength: number): void {
  cy.get('.govuk-grid-column-two-thirds')
    .find('h2')
    .should('have.length', expectedLength);
}

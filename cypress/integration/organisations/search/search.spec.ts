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
            version.status === 'live' &&
            version.occupationLocations.includes('GB-SCT'),
        ),
      );

      cy.get('input[name="nations[]"][value="GB-SCT"]').check();

      cy.get('button').click();
      cy.checkAccessibility();

      cy.get('input[name="nations[]"][value="GB-SCT"]').should('be.checked');

      cy.get('body').should('contain', 'Law Society of England and Wales');
      checkResultLength(scottishProfessions.length);
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

  it('I can go back to my search query', () => {
    cy.get('input[name="keywords"]').type('Law');

    cy.translate('industries.law').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.get('input[name="nations[]"][value="GB-ENG"]').check();

    cy.get('button').click();

    checkResultLength(1);

    cy.get('a').contains('Law Society of England and Wales').click();

    cy.translate('app.back').then((backLabel) => {
      cy.get('a').contains(backLabel).click();
    });

    checkResultLength(1);

    cy.get('input[name="keywords"]').should('have.value', 'Law');

    cy.translate('industries.law').then((nameLabel) => {
      cy.get('label')
        .contains(nameLabel)
        .parent()
        .within(() => {
          cy.get('input[name="industries[]"]').should('be.checked');
        });
    });

    cy.translate('nations.england').then((nameLabel) => {
      cy.get('label')
        .contains(nameLabel)
        .parent()
        .within(() => {
          cy.get('input[name="nations[]"]').should('be.checked');
        });
    });
  });
});

function checkResultLength(expectedLength: number): void {
  cy.get('.govuk-grid-column-two-thirds')
    .find('h2')
    .should('have.length', expectedLength);
}

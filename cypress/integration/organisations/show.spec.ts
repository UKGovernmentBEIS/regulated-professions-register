describe('Showing organisations', () => {
  beforeEach(() => {
    cy.visitAndCheckAccessibility('/');

    cy.translate('app.pages.index.useThisService.findContactDetails.text').then(
      (linkText) => {
        cy.contains(linkText).click();
      },
    );
    cy.checkAccessibility();
  });

  it('Shows the detail of an organisation, with its professions and a link to the public-facing profession page', () => {
    cy.readFile('./seeds/test/professions.json').then((professions) => {
      cy.readFile('./seeds/test/organisations.json').then((organisations) => {
        const organisation = organisations[0];
        const version = organisation.versions[0];

        cy.get('a').contains(organisation.name).click();

        cy.get('body').should('contain', organisation.name);
        cy.get('body').should('contain', version.email);
        cy.get('body').should('contain', version.url);

        cy.translate('app.backToSearch').then((backLink) => {
          cy.get('body').should('contain', backLink);
        });

        const professionsForOrganisation = professions.filter(
          (profession: any) =>
            profession.organisations.some(
              (item: any) => item.name == organisation.name,
            ) &&
            profession.versions.some(
              (version: any) => version.status === 'live',
            ),
        );

        professionsForOrganisation.forEach((profession: any) => {
          cy.should('contain', profession.name);
        });

        cy.contains(professionsForOrganisation[0].name).click();
        cy.checkAccessibility();
        cy.get('body').should('not.contain', 'Edit this profession');
        cy.get('[data-cy=back-link]').click();
        cy.translate('organisations.search.heading').then((heading) => {
          cy.contains(heading);
        });
      });
    });
  });

  it('Shows the detail of an organisation, with no link to a profession if that profession is in a draft state', () => {
    cy.readFile('./seeds/test/professions.json').then((professions) => {
      cy.readFile('./seeds/test/organisations.json').then((organisations) => {
        const councilOfRegisteredGasInstallers = organisations[1];
        const version = councilOfRegisteredGasInstallers.versions[0];

        cy.get('a').contains(councilOfRegisteredGasInstallers.name).click();

        cy.checkAccessibility();

        cy.get('body').should('contain', councilOfRegisteredGasInstallers.name);
        cy.get('body').should('contain', version.email);
        cy.get('body').should('contain', version.url);

        const draftProfessionsForOrganisation = professions.filter(
          (profession: any) =>
            profession.organisation == councilOfRegisteredGasInstallers.name,
        );

        draftProfessionsForOrganisation.forEach((draftProfession: any) => {
          cy.should('not.contain', draftProfession.name);
        });
      });
    });
  });

  it('Shows the detail of an organisation with the bare minimum fields', () => {
    cy.visitAndCheckAccessibility('/regulatory-authorities/no-optional-fields');

    cy.checkSummaryListRowValue(
      'organisations.label.url',
      'http://www.example.com',
    );

    cy.translate('organisations.label.alternateName').then(
      (alternativeNameHeading) => {
        cy.get('body').should('not.contain', alternativeNameHeading);
      },
    );

    cy.translate('organisations.label.address').then((addressHeading) => {
      cy.get('body').should('not.contain', addressHeading);
    });

    cy.translate('organisations.label.email').then((emailHeading) => {
      cy.get('body').should('not.contain', emailHeading);
    });

    cy.translate('organisations.label.telephone').then((telephoneHeading) => {
      cy.get('body').should('not.contain', telephoneHeading);
    });
  });
});

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

        const professionsForOrganisation = professions.filter(
          (profession: any) => profession.organisation == organisation.name,
        );

        professionsForOrganisation.forEach((profession: any) => {
          cy.should('contain', profession.name);
        });

        cy.contains(professionsForOrganisation[0].name).click();
        cy.checkAccessibility();
        cy.get('body').should('not.contain', 'Edit this profession');
        cy.get('[data-cy=back-link]').click();
        // This should really go back to the organisation page itself
        // but we'll fix that in a future piece of work
        cy.translate('professions.search.heading').then((heading) => {
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
});

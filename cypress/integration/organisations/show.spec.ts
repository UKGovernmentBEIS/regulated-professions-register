describe('Showing organisations', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.translate('app.pages.index.useThisService.findContactDetails.text').then(
      (linkText) => {
        cy.contains(linkText).click();
      },
    );
  });

  it('Shows the detail of an organisation', () => {
    cy.readFile('./seeds/test/professions.json').then((professions) => {
      cy.readFile('./seeds/test/organisations.json').then((organisations) => {
        const organisation = organisations[0];

        cy.get('a').contains(organisation.name).click();

        cy.get('body').should('contain', organisation.name);
        cy.get('body').should('contain', organisation.email);
        cy.get('body').should('contain', organisation.contactUrl);

        const professionsForOrganisation = professions.filter(
          (profession: any) => profession.organisation == organisation.name,
        );

        professionsForOrganisation.forEach((profession: any) => {
          cy.should('contain', profession.name);
        });
      });
    });
  });
});

describe('Listing organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin');
    });

    it('Lists all the organisations', () => {
      cy.get('a').contains('Regulatory authorities').click();

      cy.readFile('./seeds/test/professions.json').then((professions) => {
        cy.readFile('./seeds/test/organisations.json').then((organisations) => {
          organisations.forEach((organisation) => {
            cy.get('tr')
              .contains(organisation.name)
              .then(($row) => {
                cy.wrap($row).should('contain', organisation.name);
                cy.wrap($row).should('contain', organisation.alternateName);

                const professionsForOrganisation = professions.filter(
                  (profession: any) =>
                    profession.organisation == organisation.name,
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
  });
});

describe('Showing organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin');
    });

    it('Shows the detail of an organisation', () => {
      cy.get('a').contains('Regulatory authorities').click();

      cy.readFile('./seeds/test/professions.json').then((professions) => {
        cy.readFile('./seeds/test/organisations.json').then((organisations) => {
          const organisation = organisations[0];

          cy.contains(organisation.name)
            .parent('tr')
            .within(() => {
              cy.get('a').contains('View details').click();
            })
            .then(() => {
              cy.get('body').should('contain', organisation.name);
              cy.get('body').should('contain', organisation.email);
              cy.get('body').should('contain', organisation.contactUrl);

              const professionsForOrganisation = professions.filter(
                (profession: any) =>
                  profession.organisation == organisation.name,
              );

              professionsForOrganisation.forEach((profession: any) => {
                cy.should('contain', profession.name);
              });
            });
        });
      });
    });
  });
});

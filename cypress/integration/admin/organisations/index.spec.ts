describe('Listing organisations', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin');

      cy.get('a').contains('Regulatory authorities').click();
    });

    it('Lists all the organisations', () => {
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
  });
});

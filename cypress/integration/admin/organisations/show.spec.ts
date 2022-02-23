describe('Showing organisations', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('Shows the detail of an organisation, with its professions and a link to the admin profession page', () => {
      cy.get('a').contains('Regulatory authorities').click();
      cy.checkAccessibility();

      cy.readFile('./seeds/test/professions.json').then((professions) => {
        cy.readFile('./seeds/test/organisations.json').then((organisations) => {
          const organisation = organisations[0];
          const version =
            organisation.versions[organisation.versions.length - 1];

          cy.contains(organisation.name)
            .parent('tr')
            .within(() => {
              cy.get('a').contains('View details').click();
            })
            .then(() => {
              cy.checkAccessibility();
              cy.get('body').should('contain', organisation.name);
              cy.get('body').should('contain', version.email);
              cy.get('body').should('contain', version.contactUrl);

              const professionsForOrganisation = professions.filter(
                (profession: any) =>
                  profession.organisation == organisation.name,
              );

              professionsForOrganisation.forEach((profession: any) => {
                cy.should('contain', profession.name);
              });

              cy.contains(professionsForOrganisation[0].name).click();
              cy.checkAccessibility();
              cy.get('body').should('contain', 'Edit this profession');

              cy.get('[data-cy=back-link]').click();
              // This should really go back to the organisation page itself
              // but we'll fix that in a future piece of work
              cy.translate('professions.admin.heading').then((heading) => {
                cy.contains(heading);
              });
            });
        });
      });
    });
  });
});

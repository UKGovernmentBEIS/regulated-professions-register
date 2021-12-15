describe('Showing a profession', () => {
  it('I can view a profession', () => {
    cy.visit('/professions/registered-trademark-attorney');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should('contain', 'Law');
    cy.get('body').should('contain', 'The Trade Marks Act 1994');

    cy.translate('professions.show.overview.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.translate('professions.show.bodies.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.translate('professions.show.regulatedActivities.heading').then(
      (heading) => {
        cy.get('body').should('contain', heading);
      },
    );

    cy.translate('professions.show.qualification.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.translate('professions.show.legislation.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
  });
});

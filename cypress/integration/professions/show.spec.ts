describe('Showing a profession', () => {
  it('I can view a profession', () => {
    cy.visit('/professions/registered-trademark-attorney');

    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('body').should('contain', 'Law');
    cy.get('body').should('contain', 'The Trade Marks Act 1994');

    cy.translate('professions.overview.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.translate('professions.bodies.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.translate('professions.regulatedActivities.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.translate('professions.qualification.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.translate('professions.legislation.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
  });
});

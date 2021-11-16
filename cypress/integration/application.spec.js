describe('/', () => {
  it('Shows hello', () => {
    cy.visit('/');
    cy.get('body').should('contain', 'Hello!');
  });
});

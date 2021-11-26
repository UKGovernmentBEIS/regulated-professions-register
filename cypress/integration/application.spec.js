describe('/', () => {
  it('Shows hello', () => {
    cy.visit('/');
    cy.get('body').should('contain', 'Hello!');
  });

  context('when I am logged in', () => {
    beforeEach(() => {
      cy.loginAuth0();
      cy.visit('/admin');
    });

    it('shows my username', () => {
      cy.get('body').should('contain', 'Welcome beis-rpr');
    });
  });
});

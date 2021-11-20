describe('/', () => {
  it('Shows hello', () => {
    cy.visit('/');
    cy.get('body').should('contain', 'Hello!');
  });

  context('when I am logged in', () => {
    before(() => {
      cy.login();
    });

    it('allows me to access the admin area', () => {
      cy.visit('/admin');

      cy.get('body').should('contain', 'Hello Admin!');
    });
  });
});

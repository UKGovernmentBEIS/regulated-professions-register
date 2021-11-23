describe('/', () => {
  it('Shows hello', () => {
    cy.visit('/');
    cy.get('body').should('contain', 'Hello!');
  });

  context('when I am logged in', () => {
    beforeEach(() => {
      cy.login();
    });

    it('allows me to access the admin area', () => {
      cy.visit('/admin');

      cy.get('body').should('contain', 'Hello Admin!');
    });

    it('allows me to logout', () => {
      cy.visit('/admin');

      cy.get('[data-purpose=logout]').click();
    });
  });
});

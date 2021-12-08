describe('/', () => {
  it('Shows hello', () => {
    cy.visit('/');
    cy.get('body').should('contain', 'Hello!');
  });

  context('when I am logged in as an admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visit('/admin');
    });

    it('shows my username', () => {
      cy.get('body').should('contain', 'Welcome beis-rpr');
    });

    it('allows me to access the super admin area', () => {
      cy.visit('/admin/superadmin');
      cy.get('body').should('contain', 'You are a superadmin');
    });
  });

  context('when I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visit('/admin');
    });

    it('shows my username', () => {
      cy.get('body').should('contain', 'Welcome beis-rpr+editor');
    });

    it('does not allow me to access the super admin area', () => {
      cy.visit('/admin/superadmin');
      cy.get('body').should(
        'contain',
        'You have not been authorized to see this page',
      );
    });
  });
});

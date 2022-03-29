describe('/', () => {
  it('Shows a landing page', () => {
    cy.visitAndCheckAccessibility('/');

    cy.translate('app.pages.index.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
  });

  it('Shows an internal landing page', () => {
    cy.visitAndCheckAccessibility('/admin');

    cy.get('body').should(
      'contain',
      'Manage your Regulated Professions Register account',
    );
    cy.get('a')
      .contains('Sign in')
      .should('have.attr', 'href', '/admin/dashboard');
  });

  context('when I am logged in as BEIS user', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visitInternalDashboard();
    });

    it('shows my name and the BEIS organisation name', () => {
      cy.get('h1').should('contain', 'beis-rpr');

      cy.translate('app.beis').then((beis) => {
        cy.get('h1 span').should('contain', beis);
      });
    });
  });

  context('when I am logged in as a non BEIS user', () => {
    beforeEach(() => {
      cy.loginAuth0('orgadmin');
      cy.visitInternalDashboard();
    });

    it('shows my name and organisation', () => {
      cy.get('h1').should('contain', 'Organisation Admin');
      cy.get('h1 span').should('contain', 'Department for Education');
    });
  });
});

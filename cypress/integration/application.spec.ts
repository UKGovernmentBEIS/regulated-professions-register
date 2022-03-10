describe('/', () => {
  it('Shows a landing page', () => {
    cy.visitAndCheckAccessibility('/');

    cy.translate('app.pages.index.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
  });

  context('when I am logged in as BEIS user', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visitAndCheckAccessibility('/admin');
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
      cy.visitAndCheckAccessibility('/admin');
    });

    it('shows my name and organisation', () => {
      cy.get('h1').should('contain', 'Organisation Admin');
      cy.get('h1 span').should('contain', 'Department for Education');
    });
  });
});

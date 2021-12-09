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
      cy.translate('app.welcome', { name: 'beis-rpr' }).then(
        (welcomeMessage) => {
          cy.get('body').should('contain', welcomeMessage);
        },
      );
    });

    it('allows me to access the super admin area', () => {
      cy.visit('/admin/superadmin');
      cy.translate('app.superadmin', { name: 'beis-rpr' }).then(
        (superadminMessage) => {
          cy.get('body').should('contain', superadminMessage);
        },
      );
    });
  });

  context('when I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visit('/admin');
    });

    it('shows my username', () => {
      cy.translate('app.welcome', { name: 'beis-rpr+editor' }).then(
        (welcomeMessage) => {
          cy.get('body').should('contain', welcomeMessage);
        },
      );
    });

    it('does not allow me to access the super admin area', () => {
      cy.visit('/admin/superadmin');

      cy.translate('errors.forbidden.heading').then((errorMessage) => {
        cy.get('body').should('contain', errorMessage);
      });
    });
  });
});

import { format } from 'date-fns';

describe('Manage feedback', () => {
  context('When logged in as a service owner administrator', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
      cy.visitInternalDashboard();
      cy.translate('feedback.admin.heading').then((link) => {
        cy.get('#navigation').get('a').contains(link).click();
        cy.checkAccessibility();
      });
    });

    it('Displays the manage feedback dashboard', () => {
      cy.translate('feedback.admin.dashboard.title').then((title) => {
        cy.get('body').should('contain', title);
      });
    });

    it('I can export all feedback', () => {
      cy.translate('feedback.admin.dashboard.export').then((download) => {
        cy.checkFeedbackExport(
          download,
          `feedback-${format(new Date(), 'yyyyMMdd-HHmmss')}`,
        );
      });
    });
  });

  context('When logged in as an org administrator', () => {
    beforeEach(() => {
      cy.loginAuth0('orgadmin');
      cy.visitInternalDashboard();

      cy.translate('feedback.admin.heading').then((link) => {
        cy.get('#navigation').should('not.contain', link);
      });
    });

    it('Displays access denied when accessing manage feedback', () => {
      cy.visit('/admin/feedback');
      confirmAccessDenied();
    });

    it('Displays access denied when accessing export feedback', () => {
      cy.visit('/admin/feedback/export');
      confirmAccessDenied();
    });
  });

  context('When logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
      cy.visitInternalDashboard();

      cy.translate('feedback.admin.heading').then((link) => {
        cy.get('#navigation').should('not.contain', link);
      });
    });

    it('Displays access denied when accessing manage feedback', () => {
      cy.visit('/admin/feedback');
      confirmAccessDenied();
    });

    it('Displays access denied when accessing export feedback', () => {
      cy.visit('/admin/feedback/export');
      confirmAccessDenied();
    });
  });

  context('When logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitInternalDashboard();

      cy.translate('feedback.admin.heading').then((link) => {
        cy.get('#navigation').should('not.contain', link);
      });
    });

    it('Displays access denied when accessing manage feedback', () => {
      cy.visit('/admin/feedback');
      confirmAccessDenied();
    });

    it('Displays access denied when accessing export feedback', () => {
      cy.visit('/admin/feedback/export');
      confirmAccessDenied();
    });
  });

  context('When logged in as an org editor', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
      cy.visitInternalDashboard();

      cy.translate('feedback.admin.heading').then((link) => {
        cy.get('#navigation').should('not.contain', link);
      });
    });

    it('Displays access denied when accessing manage feedback', () => {
      cy.visit('/admin/feedback');
      confirmAccessDenied();
    });

    it('Displays access denied when accessing export feedback', () => {
      cy.visit('/admin/feedback/export');
      confirmAccessDenied();
    });
  });
});

function confirmAccessDenied() {
  cy.translate('errors.forbidden.heading').then((error) => {
    cy.get('body').should('contain', error);
  });
}

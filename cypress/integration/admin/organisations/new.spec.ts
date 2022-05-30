import { format } from 'date-fns';

describe('Creating organisations', () => {
  context('when I am logged in without the correct permissions', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitInternalDashboard();

      cy.get('a').contains('Regulatory authorities').click();
    });

    it('does not allow me to add an organisation', () => {
      cy.translate('organisations.admin.index.add.button').then(
        (buttonText) => {
          cy.get('body').should('not.contain', buttonText);
        },
      );
    });
  });

  context('When I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
      cy.visitInternalDashboard();

      cy.get('a').contains('Regulatory authorities').click();

      cy.translate('organisations.admin.index.add.button').then(
        (buttonText) => {
          cy.get('button').contains(buttonText).click();
        },
      );
    });

    it('Shows errors when I input data incorrectly', () => {
      cy.get('input[name="name"]').invoke('val', '');

      cy.get('input[name="url"]').invoke('val', '').type('this is not a url');

      cy.get('input[name="email"]')
        .invoke('val', '')
        .type('this is not an email');

      cy.get('input[name="telephone"]')
        .invoke('val', '')
        .type('this is not an telephone number');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('organisations.admin.form.errors.name.empty').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.translate('organisations.admin.form.errors.email.invalid').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.translate('organisations.admin.form.errors.url.invalid').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.translate('organisations.admin.form.errors.phone.invalid').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );
    });

    it('Shows errors when I input data that is too long', () => {
      cy.get('input[name="name"]').invoke('val', 'a'.repeat(501));
      cy.get('input[name="alternateName"]').invoke('val', 'a'.repeat(501));
      cy.get('input[name="url"]').invoke(
        'val',
        `http://example.com?data=${'a'.repeat(1001)}`,
      );
      cy.get('textarea[name="address"]').invoke('val', 'a'.repeat(501));

      cy.get('input[name="email"]').type('foo@example.com');
      cy.get('input[name="telephone"]').type('020 7215 5000');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.translate('organisations.admin.form.errors.name.long').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.translate('organisations.admin.form.errors.alternateName.long').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );

      cy.translate('organisations.admin.form.errors.url.long').then((error) => {
        cy.get('body').should('contain', error);
      });

      cy.translate('organisations.admin.form.errors.address.long').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );
    });

    it('allows me to create an organisation', () => {
      cy.translate('organisations.admin.create.heading').then((heading) => {
        cy.get('html').should('contain', heading);
      });

      cy.get('input[name="name"]').invoke('val', 'New Organisation');

      cy.get('input[name="alternateName"]').type('Alternate Name');

      cy.get('input[name="url"]').type('http://example.com');

      cy.get('textarea[name="address"]').type('123 Fake Street');

      cy.get('input[name="email"]').type('foo@example.com');
      cy.get('input[name="telephone"]').type('020 7215 5000');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkSummaryListRowValue(
        'organisations.label.name',
        'New Organisation',
      );
      cy.checkSummaryListRowValue(
        'organisations.label.alternateName',
        'Alternate Name',
      );
      cy.checkSummaryListRowValue(
        'organisations.label.url',
        'http://example.com',
      );
      cy.checkSummaryListRowValue(
        'organisations.label.address',
        '123 Fake Street',
      );
      cy.checkSummaryListRowValue(
        'organisations.label.email',
        'foo@example.com',
      );
      cy.checkSummaryListRowValue(
        'organisations.label.telephone',
        '+44 (0)20 7215 5000',
      );

      cy.translate('organisations.admin.button.saveAsDraft').then(
        (buttonText) => {
          cy.get('button').contains(buttonText).click();
        },
      );

      cy.translate('organisations.admin.create.confirmation.heading').then(
        (confirmationHeading) => {
          cy.get('html').should('contain', confirmationHeading);
        },
      );

      cy.translate('organisations.admin.create.confirmation.body', {
        name: 'New Organisation',
      }).then((confirmationBody) => {
        cy.get('html').should('contain.html', confirmationBody);
      });

      cy.get('body').should('contain', 'New Organisation');

      cy.translate(`app.status.draft`).then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Registrar');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+registrar@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );
    });
  });
});

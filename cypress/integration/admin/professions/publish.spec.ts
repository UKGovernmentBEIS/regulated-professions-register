import { format } from 'date-fns';

describe('Publishing professions', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('Allows me to publish a draft profession from the profession page', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Gas Safe Engineer')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('professions.admin.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.get('[data-cy=changed-by-user]').should('contain', '');

      cy.translate('professions.form.button.publish').then((publishButton) => {
        cy.get('a').contains(publishButton).click();
      });

      cy.checkAccessibility();

      // Testing back link goes where we expect
      cy.translate('app.back').then((backLink) => {
        cy.get('a').contains(backLink).click();
      });

      cy.get('h1').should('contain', 'Gas Safe Engineer');

      cy.translate('professions.form.button.publish').then((buttonText) => {
        cy.get('[data-cy=publish-button]').contains(buttonText).click();
      });

      cy.translate('professions.form.captions.publish').then(
        (publishCaption) => {
          cy.get('body').contains(publishCaption);
        },
      );

      cy.translate('professions.form.headings.publish', {
        professionName: 'Gas Safe Engineer',
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('professions.form.button.publish').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('professions.admin.publish.confirmation.heading').then(
        (confirmation) => {
          cy.get('html').should('contain', confirmation);
        },
      );

      cy.translate('professions.admin.button.edit.live').then((buttonText) => {
        cy.get('html').should('contain', buttonText);
      });

      cy.get('[data-cy=changed-by-user]').should('contain', 'Editor');
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('tr')
        .contains('Gas Safe Engineer')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('professions.admin.status.live').then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });

    it('Allows me to publish a draft profession from the check your answers page', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Orthodontic Therapist')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('professions.admin.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.get('[data-cy=changed-by-user]').should('contain', '');

      cy.translate('professions.admin.button.edit.draft').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.clickSummaryListRowAction(
        'professions.form.label.legislation.nationalLegislation',
        'Change',
      );
      cy.checkAccessibility();

      cy.get('textarea[name="nationalLegislation"]').type(
        'National legislation',
      );

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });
      cy.checkAccessibility();

      cy.checkIndexedSummaryListRowValue(
        'professions.form.label.legislation.nationalLegislation',
        'National legislation',
        1,
      );

      cy.translate('professions.form.button.publish').then((buttonText) => {
        cy.get('a').contains(buttonText).click();
      });

      // Testing back link goes where we expect
      cy.translate('app.back').then((backLink) => {
        cy.get('a').contains(backLink).click();
      });
      cy.translate('professions.form.headings.checkAnswers').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('professions.form.button.publish').then((buttonText) => {
        cy.get('a').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('professions.form.captions.publish').then(
        (publishCaption) => {
          cy.get('body').contains(publishCaption);
        },
      );

      cy.translate('professions.form.headings.publish', {
        professionName: 'Orthodontic Therapist',
      }).then((heading) => {
        cy.contains(heading);
      });

      cy.translate('professions.form.button.publish').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('professions.admin.publish.confirmation.heading').then(
        (confirmation) => {
          cy.get('html').should('contain', confirmation);
        },
      );

      cy.translate('professions.admin.button.edit.live').then((buttonText) => {
        cy.get('html').should('contain', buttonText);
      });

      cy.get('[data-cy=changed-by-user]').should('contain', 'Editor');
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('tr')
        .contains('Gas Safe Engineer')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('professions.admin.status.live').then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });
  });
});

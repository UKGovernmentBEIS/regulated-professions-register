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

      cy.translate('app.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.get('[data-cy=changed-by-text]').should('not.exist');
      cy.get('[data-cy=currently-published-version-text]').should('not.exist');

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

      cy.translate('professions.admin.changed.by').then((changedByText) => {
        cy.get('[data-cy=changed-by-text]').should('contain', changedByText);
      });
      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Editor');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+editor@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.get('[data-cy=currently-published-version-text]').within(($h2) => {
        cy.translate('professions.admin.publicFacingLink.heading').then(
          (publicFacingLinkHeading) => {
            cy.wrap($h2).should('contain', publicFacingLinkHeading);
          },
        );

        cy.translate('professions.admin.publicFacingLink.label').then(
          (publicFacingLinkLabel) => {
            cy.get('a').should('contain', publicFacingLinkLabel);
          },
        );

        cy.get('a').click();
      });
      cy.get('body').should('contain', 'Gas Safe Engineer');
      cy.go('back');

      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('tr')
        .contains('Gas Safe Engineer')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('app.status.live').then((status) => {
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

      cy.translate('app.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.get('[data-cy=changed-by-text]').should('not.exist');

      cy.translate('professions.admin.button.edit.draft').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.legislation.nationalLegislation',
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

      cy.translate('professions.admin.changed.by').then((changedByText) => {
        cy.get('[data-cy=changed-by-text]').should('contain', changedByText);
      });
      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Editor');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+editor@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('tr')
        .contains('Gas Safe Engineer')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('app.status.live').then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });

    it('Allows me to publish a draft profession with the bare minimum fields, without breaking the view', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Draft Profession')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('app.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.translate('professions.form.button.publish').then((publishButton) => {
        cy.get('a').contains(publishButton).click();
      });

      cy.checkAccessibility();

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

      cy.translate('professions.admin.changed.by').then((changedByText) => {
        cy.get('[data-cy=changed-by-text]').should('contain', changedByText);
      });
      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Editor');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+editor@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.get('[data-cy=currently-published-version-text]').within(() => {
        cy.translate('professions.admin.publicFacingLink.label').then(
          (publicFacingLinkLabel) => {
            cy.get('a').should('contain', publicFacingLinkLabel);
          },
        );

        cy.get('a').click();
      });
      cy.get('body').should('contain', 'Draft Profession');
      cy.go('back');

      cy.visitAndCheckAccessibility('/admin/professions');

      cy.get('tr')
        .contains('Draft Profession')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('app.status.live').then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });
  });

  context('When I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
      cy.visitAndCheckAccessibility('/admin');
    });

    it('I can create and publish a new profession from the Check your answers page', () => {
      cy.visitAndCheckAccessibility('/admin/professions');

      cy.translate('professions.admin.addButtonLabel').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.topLevelInformation').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.add').then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('input[name="name"]').type('Example Profession');
      cy.get('select[name="regulatoryBody"]').select(
        'Department for Education',
      );
      cy.get('select[name="regulatoryBody"]').should(
        'not.contain',
        'Unconfirmed Organisation',
      );
      cy.get('select[name="additionalRegulatoryBody"]').select(
        'General Medical Council',
      );
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      // Conditional radio buttons add an additional `aria-expanded` field,
      // so ignore that rule on this page
      cy.checkAccessibility({ 'aria-allowed-attr': { enabled: false } });
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.translate('professions.form.label.scope.certainNations').then(
        (certainNations) => {
          cy.get('label').contains(certainNations).click();
          cy.get('[type="checkbox"]').check('GB-ENG');
        },
      );

      cy.translate('industries.constructionAndEngineering').then(
        (constructionAndEngineering) => {
          cy.contains(constructionAndEngineering).click();
        },
      );
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('input[name="registrationRequirements"]').type('Requirements');

      cy.get('input[name="registrationUrl"]')
        .invoke('val', '')
        .type('https://example.com/requirement');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('professions.form.headings.regulatedActivities').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('textarea[name="regulationSummary"]').type(
        'A summary of the regulation',
      );
      cy.get('input[name="regulationType"][value="certification"]').check();
      cy.get('textarea[name="reservedActivities"]').type('An example activity');
      cy.get('textarea[name="protectedTitles"]').type(
        'An example protected title',
      );
      cy.get('input[name="regulationUrl"]').type(
        'https://example.com/regulation',
      );

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.qualifications').then(
        (heading) => {
          cy.get('body').should('contain', heading);
        },
      );
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('textarea[name="routesToObtain"]').type(
        'General secondary education',
      );
      cy.get('input[name="moreInformationUrl"]').type(
        'http://example.com/more-info',
      );

      cy.get('input[name="ukRecognition"]').type('Recognition in the UK');
      cy.get('input[name="ukRecognitionUrl"]').type('http://example.com/uk');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();
      cy.translate('professions.form.headings.legislation').then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('textarea[name="nationalLegislation"]').type(
        'National legislation description',
      );
      cy.get('input[name="link"]').type('www.example-legislation.com');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });

      cy.translate('professions.form.button.publish').then((buttonText) => {
        cy.get('a').contains(buttonText).click();
      });

      cy.checkAccessibility();

      cy.translate('professions.form.headings.publish', {
        professionName: 'Example Profession',
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

      cy.get('[data-cy=changed-by-user-name]').should('contain', 'Registrar');
      cy.get('[data-cy=changed-by-user-email]').should(
        'contain',
        'beis-rpr+registrar@dxw.com',
      );
      cy.get('[data-cy=last-modified]').should(
        'contain',
        format(new Date(), 'd MMM yyyy'),
      );

      cy.visitAndCheckAccessibility('/professions/search');

      cy.visit('/professions/search');

      cy.get('input[name="keywords"]').type('Example');
      cy.get('button').click();

      cy.get('body').should('contain', 'Example Profession');

      cy.get('a').contains('Example Profession').click();

      cy.get('h1').should('contain', 'Example Profession');
    });
  });
});

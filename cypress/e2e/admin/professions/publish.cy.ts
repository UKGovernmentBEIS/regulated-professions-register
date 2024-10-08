import { format } from 'date-fns';

describe('Publishing professions', () => {
  context('When I am logged in as an editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitInternalDashboard();
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
      cy.checkPublishNotBlocked();

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

      cy.translate('professions.admin.publish.confirmation.body', {
        name: 'Gas Safe Engineer',
      }).then((confirmation) => {
        cy.get('html').should('contain.html', confirmation);
      });

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

    it('Allows me to publish a draft profession from the Check Your Answers page', () => {
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
      cy.checkPublishBlocked(['regulatedActivities', 'qualifications'], []);

      cy.translate('professions.admin.button.edit.draft').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.qualifications.routesToObtain',
      );
      cy.checkAccessibility();
      cy.get(
        'input[name="otherCountriesRecognitionRoutes"][value="some"]',
      ).check();
      cy.get('textarea[name="routesToObtain"]').type('Routes to obtain');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.clickSummaryListRowChangeLink(
        'professions.form.label.regulatedActivities.reservedActivities',
      );
      cy.checkAccessibility();
      cy.get('textarea[name="reservedActivities"]').type('Reserved activities');
      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkSummaryListRowValue(
        'professions.form.label.qualifications.routesToObtain',
        'Routes to obtain',
      );
      cy.checkSummaryListRowValue(
        'professions.form.label.regulatedActivities.reservedActivities',
        'Reserved activities',
      );

      cy.checkPublishNotBlocked();

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

      cy.translate('professions.admin.publish.confirmation.body', {
        name: 'Orthodontic Therapist',
      }).then((confirmation) => {
        cy.get('html').should('contain.html', confirmation);
      });

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
        .contains('Orthodontic Therapist')
        .then(($header) => {
          const $row = $header.parent();

          cy.translate('app.status.live').then((status) => {
            cy.wrap($row).should('contain', status);
          });
        });
    });

    it('Does not allows me to publish a draft profession with missing fields from the profession page', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Draft Profession')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.translate('app.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.checkPublishBlocked(
        ['scope', 'regulatedActivities', 'qualifications', 'legislation'],
        [],
      );
    });

    it('Does not allows me to publish a draft profession with a draft organisation from the profession page', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Profession with draft organisation')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.translate('app.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.checkPublishBlocked([], ['Draft Organisation']);
    });

    it('Does not allows me to publish a draft profession with missing fields from the Check Your Answers page', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Draft Profession')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.translate('app.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.translate('professions.admin.button.edit.draft').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.checkPublishBlocked(
        ['scope', 'regulatedActivities', 'qualifications', 'legislation'],
        [],
        false,
      );
    });

    it('Does not allows me to publish a draft profession with a draft organisation from the Check Your Answers page', () => {
      cy.get('a').contains('Regulated professions').click();
      cy.checkAccessibility();

      cy.contains('Profession with draft organisation')
        .parent('tr')
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.translate('app.status.draft').then((status) => {
        cy.get('h2[data-status]').should('contain', status);
      });

      cy.translate('professions.admin.button.edit.draft').then((buttonText) => {
        cy.contains(buttonText).click();
      });

      cy.checkPublishBlocked([], ['Draft Organisation'], false);
    });
  });

  context('When I am logged in as a registrar', () => {
    beforeEach(() => {
      cy.loginAuth0('registrar');
      cy.visitInternalDashboard();
    });

    it('I can create and publish a new profession from the Check Your Answers page', () => {
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

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.clickSummaryListRowChangeLink(
        'professions.form.label.organisations.name',
      );
      cy.get('select[id="regulatoryBodies_1"]').should(
        'not.contain',
        'Unconfirmed Organisation',
      );

      cy.get('select[id="regulatoryBodies_1"]').select(
        'Department for Education',
      );
      cy.translate('organisations.label.roles.primaryRegulator').then(
        (label) => {
          cy.get('select[id="roles_1"]').select(label);
        },
      );

      cy.translate('professions.form.button.addRegulator').then((label) => {
        cy.get('a').contains(label).click();
      });

      cy.get('select[id="regulatoryBodies_2"]').select(
        'General Medical Council',
      );
      cy.translate('organisations.label.roles.additionalRegulator').then(
        (label) => {
          cy.get('select[id="roles_2"]').select(label);
        },
      );

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.checkPublishBlocked(
        ['scope', 'regulatedActivities', 'qualifications', 'legislation'],
        [],
      );
      cy.clickSummaryListRowChangeLink('professions.form.label.scope.nations');
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

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.checkPublishBlocked(
        ['regulatedActivities', 'qualifications', 'legislation'],
        [],
      );
      cy.clickSummaryListRowChangeLink(
        'professions.form.label.registration.registrationRequirements',
      );
      cy.checkAccessibility();
      cy.translate('professions.form.captions.addWithName', {
        professionName: 'Example Profession',
      }).then((addCaption) => {
        cy.get('body').contains(addCaption);
      });
      cy.get('textarea[name="registrationRequirements"]').type('Requirements');

      cy.get('input[name="registrationUrl"]')
        .invoke('val', '')
        .type('https://example.com/requirement');

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.checkPublishBlocked(
        ['regulatedActivities', 'qualifications', 'legislation'],
        [],
      );
      cy.clickSummaryListRowChangeLink(
        'professions.form.label.regulatedActivities.regulationType',
      );
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

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.checkPublishBlocked(['qualifications', 'legislation'], []);
      cy.clickSummaryListRowChangeLink(
        'professions.form.label.qualifications.routesToObtain',
      );
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

      cy.get('textarea[name="ukRecognition"]').type('Recognition in the UK');
      cy.get('input[name="ukRecognitionUrl"]').type('http://example.com/uk');
      cy.get(
        'input[name="otherCountriesRecognitionRoutes"][value="some"]',
      ).check();
      cy.get('textarea[name="otherCountriesRecognitionSummary"]').type(
        'Recognition in other countries',
      );
      cy.get('input[name="otherCountriesRecognitionUrl"]').type(
        'http://example.com/other',
      );

      cy.translate('app.continue').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.checkAccessibility({ 'color-contrast': { enabled: false } });
      cy.checkPublishBlocked(['legislation'], []);
      cy.clickSummaryListRowChangeLink(
        'professions.form.label.legislation.nationalLegislation',
      );
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
      cy.checkPublishNotBlocked();
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

      cy.translate('professions.admin.publish.confirmation.bodyNew', {
        name: 'Example Profession',
      }).then((confirmation) => {
        cy.get('html').should('contain.html', confirmation);
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

      cy.visitAndCheckAccessibility('/professions/search');

      cy.visit('/professions/search');

      cy.get('input[name="keywords"]').type('Example');
      cy.translate('professions.search.filter.button').then((buttonText) => {
        cy.get('button').contains(buttonText).click();
      });

      cy.get('body').should('contain', 'Example Profession');

      cy.get('a').contains('Example Profession').click();

      cy.get('h1').should('contain', 'Example Profession');
    });
  });
});

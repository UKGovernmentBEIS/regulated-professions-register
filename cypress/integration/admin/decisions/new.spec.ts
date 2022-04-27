describe('Creating a decision dataset', () => {
  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin/decisions');
    });

    it('I can create a decision dataset for a chosen organisation', () => {
      cy.get('tbody').should(
        'not.contain',
        'Profession with two tier-one Organisations',
      );

      cy.translate('decisions.admin.dashboard.addButtonLabel').then((add) => {
        cy.get('a').contains(add).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.new.labels.profession').then(
        (profession) => {
          cy.get('label')
            .contains(profession)
            .parent()
            .within(() => {
              cy.get('select').select(
                'Profession with two tier-one Organisations',
              );
            });
        },
      );

      cy.translate('decisions.admin.new.labels.organisation').then(
        (profession) => {
          cy.get('label')
            .contains(profession)
            .parent()
            .within(() => {
              cy.get('select').select('Organisation with no optional fields');
            });
        },
      );

      cy.translate('decisions.admin.new.labels.year').then((profession) => {
        cy.get('label')
          .contains(profession)
          .parent()
          .within(() => {
            cy.get('select').select('2021');
          });
      });

      cy.translate('app.continue').then((continueLabel) => {
        cy.get('button').contains(continueLabel).click();
      });

      cy.get('h1').should(
        'contain',
        'Profession with two tier-one Organisations',
      );

      cy.checkSummaryListRowValue(
        'decisions.admin.edit.regulator',
        'Organisation with no optional fields',
      );
      cy.checkSummaryListRowValue('decisions.admin.edit.year', '2021');

      cy.get('input[name="routes[1]"]').type('New route');
      cy.get('select[name="countries[1][1]"]').select('Japan');
      cy.get('input[name="yeses[1][1]"]').type('3');
      cy.get('input[name="noes[1][1]"]').type('9');
      cy.get('input[name="yesAfterComps[1][1]"]').type('8');
      cy.get('input[name="noAfterComps[1][1]"]').type('4');

      cy.translate('decisions.admin.buttons.saveAsDraft').then((save) => {
        cy.get('button').contains(save).click();
      });

      cy.get('caption').should('contain', 'New route');

      cy.checkTable(
        [
          'decisions.show.tableHeading.country',
          'decisions.show.tableHeading.yes',
          'decisions.show.tableHeading.yesAfterComp',
          'decisions.show.tableHeading.no',
          'decisions.show.tableHeading.noAfterComp',
        ],
        [['Japan', '3', '8', '9', '4']],
      );

      cy.visitAndCheckAccessibility('/admin/decisions');

      cy.get('td')
        .contains('Profession with two tier-one Organisations')
        .parent()
        .parent()
        .within(($row) => {
          cy.translate('app.status.draft').then((draft) => {
            cy.wrap($row).contains(draft);
          });
        });
    });
  });

  context('When I am logged in as an organisation editor', () => {
    beforeEach(() => {
      cy.loginAuth0('orgeditor');
      cy.visitAndCheckAccessibility('/admin/decisions');
    });

    it('I can create a decision dataset for my organisation', () => {
      cy.get('tbody').should('not.contain', '2020');

      cy.translate('decisions.admin.dashboard.addButtonLabel').then((add) => {
        cy.get('a').contains(add).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.new.labels.profession').then(
        (profession) => {
          cy.get('label')
            .contains(profession)
            .parent()
            .within(() => {
              cy.get('select').select(
                'Secondary School Teacher in State maintained schools (England)',
              );
            });
        },
      );

      cy.translate('decisions.admin.new.labels.year').then((profession) => {
        cy.get('label')
          .contains(profession)
          .parent()
          .within(() => {
            cy.get('select').select('2020');
          });
      });

      cy.translate('app.continue').then((continueLabel) => {
        cy.get('button').contains(continueLabel).click();
      });

      cy.get('h1').should(
        'contain',
        'Secondary School Teacher in State maintained schools (England)',
      );

      cy.checkSummaryListRowValue(
        'decisions.admin.edit.regulator',
        'Department for Education',
      );
      cy.checkSummaryListRowValue('decisions.admin.edit.year', '2020');

      cy.get('input[name="routes[1]"]').type('New route');
      cy.get('select[name="countries[1][1]"]').select('Brazil');
      cy.get('input[name="yeses[1][1]"]').type('8');
      cy.get('input[name="noes[1][1]"]').type('1');
      cy.get('input[name="yesAfterComps[1][1]"]').type('2');
      cy.get('input[name="noAfterComps[1][1]"]').type('3');

      cy.translate('decisions.admin.buttons.saveAsDraft').then((save) => {
        cy.get('button').contains(save).click();
      });

      cy.get('caption').should('contain', 'New route');

      cy.checkTable(
        [
          'decisions.show.tableHeading.country',
          'decisions.show.tableHeading.yes',
          'decisions.show.tableHeading.yesAfterComp',
          'decisions.show.tableHeading.no',
          'decisions.show.tableHeading.noAfterComp',
        ],
        [['Brazil', '8', '2', '1', '3']],
      );

      cy.visitAndCheckAccessibility('/admin/decisions');

      cy.get('td')
        .contains('2020')
        .parent()
        .parent()
        .within(($row) => {
          cy.translate('app.status.draft').then((draft) => {
            cy.wrap($row).contains(draft);
          });
        });
    });
  });
});

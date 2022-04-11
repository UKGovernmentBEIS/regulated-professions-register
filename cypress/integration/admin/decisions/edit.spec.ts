describe('Editing a decision dataset', () => {
  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin/decisions');
    });

    it('I can edit a decision dataset', () => {
      cy.get('tr')
        .contains(
          'Secondary School Teacher in State maintained schools (England)',
        )
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.checkAccessibility();

      cy.translate('decisions.admin.show.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });
      cy.checkAccessibility({
        label: { enabled: false },
        'select-name': { enabled: false },
      });

      withinEditTableDiv('International Route', () => {
        cy.get('tbody tr')
          .eq(1)
          .within(() => {
            cy.translate('decisions.admin.buttons.removeCountry').then(
              (removeCountry) => {
                cy.get('button').contains(removeCountry).click();
              },
            );
          });
      });

      cy.checkAccessibility({
        label: { enabled: false },
        'select-name': { enabled: false },
      });

      withinEditTableDiv('International Route', () => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.translate('decisions.admin.buttons.removeCountry').then(
              (removeCountry) => {
                cy.get('button')
                  .contains(removeCountry)
                  .should('have.attr', 'disabled', 'disabled');
              },
            );
            cy.get('select').invoke('val').should('equal', 'Germany');
          });

        cy.translate('decisions.admin.buttons.addCountry').then(
          (addCountry) => {
            cy.get('button').contains(addCountry).click();
          },
        );
      });

      cy.checkAccessibility({
        label: { enabled: false },
        'select-name': { enabled: false },
      });

      withinEditTableDiv('International Route', () => {
        cy.get('tbody tr').should('have.length', 2);
        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.get('select').invoke('val').should('equal', 'Germany');
            cy.get('select').select('Morocco');

            cy.get('input').eq(0).clear().type('11');
            cy.get('input').eq(1).clear().type('4');
            cy.get('input').eq(2).clear().type('11');
            cy.get('input').eq(3).clear().type('9');
          });
        cy.get('tbody tr')
          .eq(1)
          .within(() => {
            cy.get('select').invoke('val').should('equal', '');
            cy.get('select').select('Japan');

            cy.get('input').eq(0).type('5');
            cy.get('input').eq(1).type('7');
            cy.get('input').eq(2).type('12');
            cy.get('input').eq(3).type('2');
          });
      });

      withinEditTableDiv('EEA Route', () => {
        cy.translate('decisions.admin.buttons.removeRoute').then(
          (removeRoute) => {
            cy.get('button').contains(removeRoute).click();
          },
        );
      });

      withinEditTableDiv('International Route', () => {
        cy.translate('decisions.admin.buttons.removeRoute').then(
          (removeRoute) => {
            cy.get('button')
              .contains(removeRoute)
              .should('have.attr', 'disabled', 'disabled');
          },
        );
      });

      cy.checkAccessibility({
        label: { enabled: false },
        'select-name': { enabled: false },
      });

      cy.translate('decisions.admin.buttons.addRoute').then((addRoute) => {
        cy.get('button').contains(addRoute).click();
      });

      cy.checkAccessibility({
        label: { enabled: false },
        'select-name': { enabled: false },
      });

      withinEditTableDiv(undefined, () => {
        cy.get('caption input').type('New Route');

        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.get('select').invoke('val').should('equal', '');
            cy.get('select').select('Poland');

            cy.get('input').eq(0).type('4');
            cy.get('input').eq(1).type('4');
            cy.get('input').eq(2).type('9');
            cy.get('input').eq(3).type('0');
          });

        cy.translate('decisions.admin.buttons.addCountry').then(
          (addCountry) => {
            cy.get('button').contains(addCountry).click();
          },
        );
      });

      cy.checkAccessibility({
        label: { enabled: false },
        'select-name': { enabled: false },
      });

      withinEditTableDiv('New Route', () => {
        cy.get('tbody tr')
          .eq(1)
          .within(() => {
            cy.get('select').invoke('val').should('equal', '');
            cy.get('select').select('Italy');

            cy.get('input').eq(0).type('8');
            cy.get('input').eq(1).type('1');
            cy.get('input').eq(2).type('4');
            cy.get('input').eq(3).type('9');
          });
      });

      cy.translate('decisions.admin.buttons.saveAsDraft').then(
        (saveAsDraft) => {
          cy.get('button').contains(saveAsDraft).click();
        },
      );

      cy.checkAccessibility();

      cy.get('table caption')
        .contains('International Route')
        .parent()
        .parent()
        .within(() => {
          cy.checkTable(
            [
              'decisions.show.tableHeading.country',
              'decisions.show.tableHeading.yes',
              'decisions.show.tableHeading.yesAfterComp',
              'decisions.show.tableHeading.no',
              'decisions.show.tableHeading.noAfterComp',
            ],
            [
              ['Morocco', '11', '4', '11', '9'],
              ['Japan', '5', '7', '12', '2'],
            ],
          );
        });

      cy.get('table caption')
        .contains('New Route')
        .parent()
        .parent()
        .within(() => {
          cy.checkTable(
            [
              'decisions.show.tableHeading.country',
              'decisions.show.tableHeading.yes',
              'decisions.show.tableHeading.yesAfterComp',
              'decisions.show.tableHeading.no',
              'decisions.show.tableHeading.noAfterComp',
            ],
            [
              ['Poland', '4', '4', '9', '0'],
              ['Italy', '8', '1', '4', '9'],
            ],
          );
        });
    });

    it('I can publish a decision dataset', () => {
      cy.translate('app.status.draft').then((draft) => {
        cy.get('tr')
          .contains('Registered Trademark Attorney')
          .parent()
          .contains(draft)
          .parent()
          .parent()
          .within(() => {
            cy.get('a').contains('View details').click();
          });
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.show.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });
      cy.checkAccessibility({
        label: { enabled: false },
        'select-name': { enabled: false },
      });

      cy.translate('decisions.admin.buttons.publish').then((publish) => {
        cy.get('button').contains(publish).click();
      });

      cy.visitAndCheckAccessibility('/admin/decisions');

      cy.translate('app.status.draft').then((draft) => {
        cy.get('tr')
          .contains('Registered Trademark Attorney')
          .parent()
          .should('not.contain', draft);
      });
    });
  });
});

function withinEditTableDiv(tableName: string, func: () => void) {
  cy.get(tableName ? `input[value="${tableName}"]` : 'input:not([value])')
    .parent()
    .parent()
    .parent()
    .parent()
    .within(func);
}

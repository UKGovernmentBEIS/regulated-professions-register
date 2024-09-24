describe('Editing a decision dataset', () => {
  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitInternalDashboard();
      cy.translate(
        'app.pages.admin.dashboard.editDecisionDataCentralAdmin',
      ).then((link) => {
        cy.get('a').contains(link).click();
        cy.checkAccessibility();
      });
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

      cy.translate('decisions.admin.buttons.edit').then((edit) => {
        cy.get('a').contains(edit).click().url().should('contain', 'new');
      });

      cy.get('a').contains('Back').click().url().should('not.contain', 'new');

      cy.translate('decisions.admin.buttons.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });

      cy.translate('decisions.admin.edit.confirmation.heading').then(
        (heading) => {
          cy.get('h1').contains(heading);
        },
      );
      cy.contains(
        'Secondary School Teacher in State maintained schools (England)',
      );
      cy.contains('Department for Education');
      cy.contains('2019');

      cy.translate('decisions.admin.buttons.edit').then((buttonText) => {
        cy.get('a').contains(buttonText).click();
      });

      cy.get('a').contains('Back').click().url().should('contain', 'new');

      cy.translate('decisions.admin.buttons.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });

      cy.checkAccessibility();

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

      cy.checkAccessibility();

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
            cy.get('select').invoke('val').should('equal', 'DE');
          });

        cy.translate('decisions.admin.buttons.addCountry').then(
          (addCountry) => {
            cy.get('button').contains(addCountry).click();
          },
        );
      });

      cy.checkAccessibility();

      withinEditTableDiv('International Route', () => {
        cy.get('tbody tr').should('have.length', 2);
        cy.get('tbody tr')
          .eq(0)
          .within(() => {
            cy.get('select').invoke('val').should('equal', 'DE');
            cy.get('select').select('Morocco');

            cy.get('input').eq(0).clear().type('11');
            cy.get('input').eq(1).clear().type('4');
            cy.get('input').eq(2).clear().type('11');
            cy.get('input').eq(3).clear().type('9');
            cy.get('input').eq(4).clear().type('2');
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
            cy.get('input').eq(4).type('4');
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

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.addRoute').then((addRoute) => {
        cy.get('button').contains(addRoute).click();
      });

      cy.checkAccessibility();

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
            cy.get('input').eq(4).type('2');
          });

        cy.translate('decisions.admin.buttons.addCountry').then(
          (addCountry) => {
            cy.get('button').contains(addCountry).click();
          },
        );
      });

      cy.checkAccessibility();

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
            cy.get('input').eq(4).type('0');
          });
      });

      cy.translate('decisions.admin.buttons.saveAsDraft').then(
        (saveAsDraft) => {
          cy.get('button').contains(saveAsDraft).click();
        },
      );

      cy.checkAccessibility();

      cy.translate('decisions.admin.saveAsDraft.confirmation.heading').then(
        (confirmationHeading) => {
          cy.get('body').should('contain', confirmationHeading);
        },
      );

      cy.get('table caption')
        .contains('International Route')
        .parent()
        .parent()
        .within(() => {
          cy.checkVerticalTable(
            [
              'decisions.show.tableHeading.country',
              'decisions.show.tableHeading.yes',
              'decisions.show.tableHeading.yesAfterComp',
              'decisions.show.tableHeading.no',
              'decisions.show.tableHeading.noAfterComp',
              'decisions.show.tableHeading.noOtherConditions',
            ],
            [
              ['Morocco', '11', '4', '11', '9', '2'],
              ['Japan', '5', '7', '12', '2', '4'],
            ],
          );
        });

      cy.get('table caption')
        .contains('New Route')
        .parent()
        .parent()
        .within(() => {
          cy.checkVerticalTable(
            [
              'decisions.show.tableHeading.country',
              'decisions.show.tableHeading.yes',
              'decisions.show.tableHeading.yesAfterComp',
              'decisions.show.tableHeading.no',
              'decisions.show.tableHeading.noAfterComp',
              'decisions.show.tableHeading.noOtherConditions',
            ],
            [
              ['Poland', '4', '4', '9', '0', '2'],
              ['Italy', '8', '1', '4', '9', '0'],
            ],
          );
        });
    });

    it('I can publish a decision dataset from the edit page', () => {
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

      cy.translate('decisions.admin.buttons.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.publish').then((publish) => {
        cy.get('button').contains(publish).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.publication.caption').then(
        (publishCaption) => {
          cy.get('body').contains(publishCaption);
        },
      );

      cy.translate('decisions.admin.publication.heading').then((heading) => {
        cy.contains(heading);
      });

      cy.contains('Registered Trademark Attorney');
      cy.contains('Alternative Law Society');
      cy.contains('2020');

      cy.translate('decisions.admin.buttons.publish').then((publishButton) => {
        cy.get('button').contains(publishButton).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.publication.confirmation.heading').then(
        (confirmationHeading) => {
          cy.get('body').should('contain', confirmationHeading);
        },
      );

      cy.visitAndCheckAccessibility('/admin/decisions');

      cy.translate('app.status.draft').then((draft) => {
        cy.get('tr')
          .contains('Registered Trademark Attorney')
          .parent()
          .should('not.contain', draft);
      });
    });

    it('I cannot submit decision data', () => {
      cy.translate('app.status.draft').then((draft) => {
        cy.get('tr')
          .contains(
            'Secondary School Teacher in State maintained schools (England)',
          )
          .parent()
          .contains(draft)
          .parent()
          .parent()
          .within(() => {
            cy.get('a').contains('View details').click();
          });
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.submit').then((submit) => {
        cy.get('button').should('not.contain', submit);
      });
    });
  });

  context('When I am logged in as an org user', () => {
    beforeEach(() => {
      cy.loginAuth0('orgadmin');
      cy.visitInternalDashboard();
      cy.translate('app.pages.admin.dashboard.editDecisionDataRegulators').then(
        (link) => {
          cy.get('a').contains(link).click();
          cy.checkAccessibility();
        },
      );
    });

    it('I cannot publish decision data', () => {
      cy.translate('app.status.draft').then((draft) => {
        cy.get('tr')
          .contains(
            'Secondary School Teacher in State maintained schools (England)',
          )
          .parent()
          .contains(draft)
          .parent()
          .parent()
          .within(() => {
            cy.get('a').contains('View details').click();
          });
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.publish').then((publish) => {
        cy.get('button').should('not.contain', publish);
      });
    });

    it('I can submit decision data from the edit page', () => {
      cy.translate('app.status.draft').then((draft) => {
        cy.get('tr')
          .contains(
            'Secondary School Teacher in State maintained schools (England)',
          )
          .parent()
          .contains(draft)
          .parent()
          .parent()
          .within(() => {
            cy.get('a').contains('View details').click();
          });
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.edit').then((edit) => {
        cy.get('a').contains(edit).click();
      });

      cy.translate('decisions.admin.buttons.edit').then((editButton) => {
        cy.get('a').contains(editButton).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.buttons.submit').then((submitButton) => {
        cy.get('button').contains(submitButton).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.admin.submission.caption').then(
        (submitCaption) => {
          cy.get('body').contains(submitCaption);
        },
      );

      cy.translate('decisions.admin.submission.heading').then((heading) => {
        cy.contains(heading);
      });

      cy.contains(
        'Secondary School Teacher in State maintained schools (England)',
      );
      cy.contains('2019');

      cy.translate('decisions.admin.buttons.submit').then((submitButton) => {
        cy.get('button').contains(submitButton).click();
      });

      cy.checkAccessibility();

      cy.translate('decisions.show.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('decisions.admin.submission.confirmation.heading').then(
        (confirmationHeading) => {
          cy.get('body').should('contain', confirmationHeading);
        },
      );
    });
  });
});

function withinEditTableDiv(tableName: string, func: () => void) {
  cy.get(tableName ? `input[value="${tableName}"]` : 'input[value=""]')
    .parent()
    .parent()
    .parent()
    .parent()
    .first()
    .within(func);
}

import { format } from 'date-fns';

describe('Showing a decision dataset', () => {
  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin/decisions');
    });

    it('I can view a decision dataset', () => {
      cy.get('tr')
        .contains(
          'Secondary School Teacher in State maintained schools (England)',
        )
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.checkAccessibility();

      cy.translate('decisions.show.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.get('body').should(
        'contain',
        'Secondary School Teacher in State maintained schools (England)',
      );

      cy.checkSummaryListRowValue(
        'decisions.show.regulator',
        'Department for Education',
      );

      cy.checkSummaryListRowValue('decisions.show.year', '2019');

      cy.get('table caption').should('contain', 'EEA Route');
      cy.get('table caption')
        .contains('EEA Route')
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
              'decisions.show.tableHeading.total',
            ],
            [
              ['Morocco', '6', '1', '4', '9', '20'],
              ['Poland', '8', '1', '0', '7', '16'],
            ],
          );
        });

      cy.get('table caption').should('contain', 'International Route');
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
              'decisions.show.tableHeading.total',
            ],
            [
              ['Germany', '1', '7', '2', '4', '14'],
              ['Italy', '5', '1', '8', '3', '17'],
            ],
          );
        });
    });

    it('the sidebar shows the correct data', () => {
      cy.get('tr')
        .contains('Registered Trademark Attorney')
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.get('h2')
        .contains('Status')
        .get('.govuk-tag--yellow')
        .contains('Draft');

      cy.get('h2')
        .contains('Last modified')
        .get('[data-cy=last-modified]')
        .should('contain', format(new Date(), 'd MMM yyyy'));

      cy.get('h2')
        .contains('Changed by')
        .get('[data-cy=changed-by-text]')
        .should('contain', 'Organisation Admin')
        .should('contain', 'beis-rpr+orgadmin@dxw.com');

      cy.get('nav').find('ul').should('have.length', 2);
    });

    it('I can edit the data by clicking the edit button', () => {
      cy.get('tr')
        .contains('Registered Trademark Attorney')
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });
      cy.translate('decisions.admin.buttons.edit').then((editButtonText) => {
        cy.get('a')
          .contains(editButtonText)
          .click()
          .url()
          .should('contain', 'edit');
      });
    });

    it('I can view the "Currently published version" by clicking the link button', () => {
      cy.get('tr')
        .contains('Registered Trademark Attorney')
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });
      cy.translate('decisions.admin.publicFacingLink.label').then(
        (publicFacingLinkButtonText) => {
          cy.get('[data-cy="currently-published-version-text"]').contains(
            publicFacingLinkButtonText,
          );
        },
      );
      cy.translate('decisions.admin.publicFacingLink.heading').then(
        (publicFacingLinkButtonText) => {
          cy.get('[data-cy="currently-published-version-text"]')
            .contains(publicFacingLinkButtonText)
            .contains('a')
            .click()
            .url()
            .should('contain', '');
        },
      );
    });

    it('I can download a decision dataset', () => {
      cy.get('tr')
        .contains(
          'Secondary School Teacher in State maintained schools (England)',
        )
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.translate('decisions.admin.show.download', {
        profession:
          'Secondary School Teacher in State maintained schools (England)',
      }).then((download) => {
        cy.checkCsvDownload(
          download,
          'decisions-secondary-school-teacher-in-state-maintained-schools-england-department-for-education-2019',
          (dataset) => {
            return (
              dataset.profession ===
                'Secondary School Teacher in State maintained schools (England)' &&
              dataset.organisation === 'Department for Education' &&
              dataset.year === 2019
            );
          },
        );
      });
    });
  });
});

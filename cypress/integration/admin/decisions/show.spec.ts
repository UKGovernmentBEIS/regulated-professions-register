describe('Listing decision datasets', () => {
  context('When I am logged in as admin', () => {
    beforeEach(() => {
      cy.loginAuth0('admin');
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
            ],
            [
              ['Morocco', '6', '1', '4', '9'],
              ['Poland', '8', '1', '0', '7'],
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
            ],
            [
              ['Germany', '1', '7', '2', '4'],
              ['Italy', '5', '1', '8', '3'],
            ],
          );
        });
    });
  });
});
describe("Showing a profession's decision data", () => {
  it("I can view a profession's decision data", () => {
    cy.visitAndCheckAccessibility('/professions/search');
    cy.get('a').contains('Registered Trademark Attorney').click();

    cy.translate('professions.show.decisions.heading').then((heading) => {
      cy.get('h2')
        .contains(heading)
        .next()
        .within(() => {
          cy.get('a').contains('2021').click();
        });
    });

    cy.checkAccessibility();

    cy.translate('decisions.public.heading').then((heading) => {
      cy.get('h1').should('contain', heading);
    });
    cy.get('body').should('contain', 'Registered Trademark Attorney');
    cy.get('h2').should('contain', '2021');
    cy.get('h3').should('contain', 'Law Society of England and Wales');
    cy.get('table caption').should('contain', 'EEA Route');

    cy.checkHorizontalTable(
      [
        'decisions.public.tableHeading.yes',
        'decisions.public.tableHeading.yesAfterComp',
        'decisions.public.tableHeading.no',
        'decisions.public.tableHeading.noAfterComp',
        'decisions.public.tableHeading.noOtherConditions',
        'decisions.public.tableHeading.total',
      ],
      [['15', '4', '13', '4', '4', '40']],
    );

    cy.translate('app.back').then((back) => {
      cy.get('a').contains(back).click();
    });
    cy.url().should('contain', '/professions/registered-trademark-attorney');
  });
});

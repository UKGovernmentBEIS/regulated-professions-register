describe('Showing a profession', () => {
  it('I can view a profession', () => {
    cy.visitAndCheckAccessibility('/professions/registered-trademark-attorney');

    cy.get('body').should('contain', 'Registered Trademark Attorney');

    cy.translate('professions.show.overview.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.translate('professions.show.bodies.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });

    cy.get('h3').should('contain', 'Law Society of England and Wales');
    cy.get('h3')
      .contains('Law Society of England and Wales')
      .parent()
      .within(() => {
        cy.checkSummaryListRowMultilineValue(
          'professions.show.bodies.address',
          ['456 Example Street', 'London', 'EC1 1AB'],
        );
        cy.checkSummaryListRowValue(
          'professions.show.bodies.emailAddress',
          'law@example.com',
        );
        cy.checkSummaryListRowValue(
          'professions.show.bodies.url',
          'www.lawsociety.org.uk',
        );
        cy.checkSummaryListRowValue(
          'professions.show.bodies.phoneNumber',
          '+44 0123 456789',
        );
      });

    cy.translate('professions.show.regulatedActivities.heading').then(
      (heading) => {
        cy.get('body h2').should('contain', heading);

        cy.get('body h2')
          .contains(heading)
          .parent()
          .within(() => {
            cy.translate(
              'professions.show.regulatedActivities.regulationSummary',
            ).then((summaryHeading) => {
              cy.get('h3').should('contain', summaryHeading);

              cy.get('h3')
                .contains(summaryHeading)
                .parent()
                .within(() => {
                  cy.get('p').should(
                    'contain',
                    'Registration protection and exploitation of trade marks',
                  );
                });
            });

            cy.translate(
              'professions.show.regulatedActivities.protectedTitles',
            ).then((protectedTitlesHeading) => {
              cy.get('h3').should('contain', protectedTitlesHeading);

              cy.get('h3')
                .contains(protectedTitlesHeading)
                .parent()
                .within(() => {
                  cy.get('p').should('contain', 'Trade Mark Agent');
                });
            });
          });
      },
    );

    cy.translate('professions.show.qualification.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
    cy.checkSummaryListRowValue(
      'professions.show.qualification.routesToObtain',
      'Have a degree in any subject that is equivalent to a UK degree or level 6 qualification, or other qualification and/or experience equivalent to this.',
    );
    cy.checkSummaryListRowValue(
      'professions.show.qualification.moreInformationUrl',
      'https://www.sra.org.uk/become-solicitor/qualified-lawyers/',
    );

    cy.translate('professions.show.legislation.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
    cy.checkSummaryListRowValue(
      'professions.show.legislation.nationalLegislation',
      'The Trade Marks Act 1994',
    );

    cy.translate('professions.show.overview.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
  });
});

describe('Listing professions', () => {
  context('When I am logged in as editor', () => {
    beforeEach(() => {
      cy.loginAuth0('editor');
      cy.visitAndCheckAccessibility('/admin/professions');
    });

    it('I can click a profession to be taken to its details page', () => {
      cy.get('tr')
        .contains('Registered Trademark Attorney')
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.checkAccessibility();

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

      cy.get('h3').should('contain', 'Alternative Law Society');
      cy.get('h3')
        .contains('Alternative Law Society')
        .parent()
        .within(() => {
          cy.checkSummaryListRowMultilineValue(
            'professions.show.bodies.address',
            ['123 Example Street', 'London', 'WC1 1AB'],
          );
          cy.checkSummaryListRowValue(
            'professions.show.bodies.emailAddress',
            'alt-law@example.com',
          );
          cy.checkSummaryListRowValue(
            'professions.show.bodies.url',
            'www.alt-lawsociety.org.uk',
          );
          cy.checkSummaryListRowValue(
            'professions.show.bodies.phoneNumber',
            '+44 0123 987654',
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

    it('I can view a profession with the bare minimum fields', () => {
      cy.get('tr')
        .contains('Profession with no optional fields')
        .parent()
        .within(() => {
          cy.get('a').contains('View details').click();
        });

      cy.checkAccessibility();

      cy.get('body').should('contain', 'Profession with no optional fields');

      cy.translate('professions.show.overview.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('professions.show.bodies.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.get('h3').should('contain', 'Organisation with no optional fields');
      cy.get('h3')
        .contains('Organisation with no optional fields')
        .parent()
        .within(() => {
          cy.checkSummaryListRowValue('professions.show.bodies.address', '');
          cy.checkSummaryListRowValue(
            'professions.show.bodies.emailAddress',
            '',
          );
          cy.checkSummaryListRowValue(
            'professions.show.bodies.url',
            'http://www.example.com',
          );
          cy.checkSummaryListRowValue(
            'professions.show.bodies.phoneNumber',
            '',
          );
        });

      cy.translate('professions.show.regulatedActivities.heading').then(
        (heading) => {
          cy.get('body h2').should('contain', heading);

          cy.get('body h2')
            .contains(heading)
            .parent()
            .within(($div) => {
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
                      'A description of the profession',
                    );
                  });
              });

              cy.translate(
                'professions.show.regulatedActivities.protectedTitles',
              ).then((protectedTitlesHeading) => {
                cy.wrap($div).should('contain', protectedTitlesHeading);
              });

              cy.translate(
                'professions.show.regulatedActivities.regulationUrl',
              ).then((regulationUrlHeading) => {
                cy.wrap($div).should('contain', regulationUrlHeading);
              });
            });
        },
      );

      cy.translate('professions.show.qualification.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.checkSummaryListRowValue(
        'professions.show.qualification.routesToObtain',
        'General post-secondary education',
      );
      cy.checkSummaryListRowValue(
        'professions.show.qualification.moreInformationUrl',
        '',
      );

      cy.translate('professions.show.legislation.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.checkSummaryListRowValue(
        'professions.show.legislation.nationalLegislation',
        "The Education (School Teachers' Qualifications) (England) Regulations 2003/1662 (as amended)",
      );

      cy.translate('professions.show.overview.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });
    });
  });
});

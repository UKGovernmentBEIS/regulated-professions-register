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

            cy.translate('professions.regulationTypes.certification.name').then(
              (certificationText) => {
                cy.translate(
                  'professions.show.regulatedActivities.regulationType',
                ).then((regulationTypeHeading) => {
                  cy.get('h3').should('contain', regulationTypeHeading);

                  cy.get('h3')
                    .contains(regulationTypeHeading)
                    .parent()
                    .within(() => {
                      cy.get('p').should('contain', certificationText);
                    });
                });
              },
            );

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

    cy.translate('professions.show.registration.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
    cy.checkSummaryListRowValue(
      'professions.show.registration.registrationRequirements',
      'Example registration requirements',
    );
    cy.checkSummaryListRowValue(
      'professions.show.registration.registrationUrl',
      'http://www.example.com/law-society-registration',
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
    cy.visitAndCheckAccessibility('/professions/no-optional-fields');

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
      .within(($div) => {
        cy.translate('professions.show.bodies.address').then((addressLabel) => {
          cy.wrap($div).should('not.contain', addressLabel);
        });

        cy.translate('professions.show.bodies.emailAddress').then(
          (emailAddressLabel) => {
            cy.wrap($div).should('not.contain', emailAddressLabel);
          },
        );

        cy.translate('professions.show.bodies.phoneNumber').then(
          (phoneNumberLabel) => {
            cy.wrap($div).should('not.contain', phoneNumberLabel);
          },
        );

        cy.checkSummaryListRowValue(
          'professions.show.bodies.url',
          'http://www.example.com',
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
              'professions.show.regulatedActivities.regulationType',
            ).then((regulationTypeHeading) => {
              cy.wrap($div).should('not.contain', regulationTypeHeading);
            });

            cy.translate(
              'professions.show.regulatedActivities.protectedTitles',
            ).then((protectedTitlesHeading) => {
              cy.wrap($div).should('not.contain', protectedTitlesHeading);
            });

            cy.translate(
              'professions.show.regulatedActivities.regulationUrl',
            ).then((regulationUrlHeading) => {
              cy.wrap($div).should('not.contain', regulationUrlHeading);
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
    cy.translate('professions.show.qualification.moreInformationUrl').then(
      (moreInformationUrl) => {
        cy.get('body').should('not.contain', moreInformationUrl);
      },
    );
    cy.translate('professions.show.registration.heading').then((heading) => {
      cy.get('body').should('not.contain', heading);
    });

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

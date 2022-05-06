describe('Showing a profession', () => {
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

      cy.translate('professions.show.bodies.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('app.unitedKingdom').then((uk) => {
        cy.checkSummaryListRowValue('professions.show.overview.nations', uk);
      });

      cy.translate('industries.law').then((law) => {
        cy.checkSummaryListRowList('professions.show.overview.industry', [law]);
      });

      cy.translate('organisations.label.roles.primaryRegulator').then(
        (header) => {
          cy.get('h3').should('contain', header);

          cy.get('h3')
            .contains(header)
            .parent()
            .within(() => {
              cy.checkSummaryListRowValue(
                'professions.show.bodies.regulatedAuthority',
                'Law Society of England and Wales',
              );
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
                '+44 (0)123 456789',
              );
            });
        },
      );

      cy.translate('organisations.label.roles.additionalRegulator').then(
        (header) => {
          cy.get('h3').should('contain', header);
          cy.get('h3')
            .contains(header)
            .parent()
            .within(() => {
              cy.checkSummaryListRowValue(
                'professions.show.bodies.regulatedAuthority',
                'Alternative Law Society',
              );
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
                '+44 (0)123 987654',
              );
            });
        },
      );

      cy.translate('professions.show.regulatedActivities.heading').then(
        (heading) => {
          cy.get('h2').should('contain', heading);

          cy.get('h2')
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
                'professions.regulationTypes.certification.name',
              ).then((certificationText) => {
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
        cy.get('h2').should('contain', heading);

        cy.get('h2')
          .contains(heading)
          .parent()
          .within(() => {
            cy.translate('professions.show.qualification.overviewHeading').then(
              (overviewHeading) => {
                cy.get('h3').should('contain', overviewHeading);

                cy.get('h3')
                  .contains(overviewHeading)
                  .parent()
                  .within(() => {
                    cy.checkSummaryListRowValue(
                      'professions.show.qualification.routesToObtain',
                      'Have a degree in any subject that is equivalent to a UK degree or level 6 qualification, or other qualification and/or experience equivalent to this.',
                    );

                    cy.checkSummaryListRowValue(
                      'professions.show.qualification.moreInformationUrl',
                      'https://www.sra.org.uk/become-solicitor/qualified-lawyers/',
                    );
                  });
              },
            );

            cy.translate(
              'professions.show.qualification.otherCountriesHeading',
            ).then((otherCountriesHeading) => {
              cy.get('h3').should('contain', otherCountriesHeading);

              cy.get('h3')
                .contains(otherCountriesHeading)
                .parent()
                .within(() => {
                  cy.translate(
                    'professions.show.qualification.otherCountriesRecognition.routes.none',
                  ).then((noneRoutes) => {
                    cy.checkSummaryListRowValue(
                      'professions.show.qualification.otherCountriesRecognition.routes.label',
                      noneRoutes,
                    );
                  });
                });
            });
          });
      });

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

      cy.translate(
        'professions.show.legislation.secondNationalLegislation',
      ).then((label) => {
        cy.get('body').should('contain', label);
      });
      cy.translate('professions.show.legislation.secondLink').then((label) => {
        cy.get('body').should('contain', label);
      });

      cy.translate('professions.show.decisions.heading').then((heading) => {
        cy.get('h2').should('not.contain', heading);
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

      cy.translate('professions.show.bodies.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate('nations.england').then((england) => {
        cy.translate('nations.northernIreland').then((northernIreland) => {
          cy.checkSummaryListRowList('professions.show.overview.nations', [
            england,
            northernIreland,
          ]);
        });
      });

      cy.translate('industries.education').then((education) => {
        cy.checkSummaryListRowList('professions.show.overview.industry', [
          education,
        ]);
      });

      cy.translate('organisations.label.roles.primaryRegulator').then(
        (header) => {
          cy.get('h3').should('contain', header);
          cy.get('h3')
            .contains(header)
            .parent()
            .within(() => {
              cy.checkSummaryListRowValue(
                'professions.show.bodies.regulatedAuthority',
                'Organisation with no optional fields',
              );
              cy.checkSummaryListRowValue(
                'professions.show.bodies.address',
                '',
              );
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
        },
      );

      cy.translate('professions.show.regulatedActivities.heading').then(
        (heading) => {
          cy.get('h2').should('contain', heading);

          cy.get('h2')
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
                cy.wrap($div).should('contain', regulationTypeHeading);
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
        cy.get('h2').should('contain', heading);

        cy.get('h2')
          .contains(heading)
          .parent()
          .within(() => {
            cy.translate('professions.show.qualification.overviewHeading').then(
              (overviewHeading) => {
                cy.get('h3').should('contain', overviewHeading);

                cy.get('h3')
                  .contains(overviewHeading)
                  .parent()
                  .within(() => {
                    cy.checkSummaryListRowValue(
                      'professions.show.qualification.routesToObtain',
                      'General post-secondary education',
                    );

                    cy.checkSummaryListRowValue(
                      'professions.show.qualification.moreInformationUrl',
                      '',
                    );
                  });
              },
            );

            cy.translate('professions.show.qualification.ukHeading').then(
              (ukHeading) => {
                cy.get('h3').should('contain', ukHeading);

                cy.get('h3')
                  .contains(ukHeading)
                  .parent()
                  .within(() => {
                    cy.checkSummaryListRowValue(
                      'professions.show.qualification.ukRecognition',
                      '',
                    );

                    cy.checkSummaryListRowValue(
                      'professions.show.qualification.ukRecognitionUrl',
                      '',
                    );
                  });
              },
            );

            cy.translate(
              'professions.show.qualification.otherCountriesHeading',
            ).then((otherCountriesHeading) => {
              cy.get('h3').should('contain', otherCountriesHeading);

              cy.get('h3')
                .contains(otherCountriesHeading)
                .parent()
                .within(() => {
                  cy.translate(
                    'professions.show.qualification.otherCountriesRecognition.routes.all',
                  ).then((allRoutes) => {
                    cy.checkSummaryListRowValue(
                      'professions.show.qualification.otherCountriesRecognition.routes.label',
                      allRoutes,
                    );
                  });

                  cy.checkSummaryListRowValue(
                    'professions.show.qualification.otherCountriesRecognition.summary',
                    '',
                  );

                  cy.checkSummaryListRowValue(
                    'professions.show.qualification.otherCountriesRecognition.url',
                    '',
                  );
                });
            });
          });
      });

      cy.translate('professions.show.registration.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.checkSummaryListRowValue(
        'professions.show.registration.registrationRequirements',
        '',
      );
      cy.checkSummaryListRowValue(
        'professions.show.registration.registrationUrl',
        '',
      );

      cy.translate('professions.show.legislation.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });
      cy.checkSummaryListRowValue(
        'professions.show.legislation.nationalLegislation',
        "The Education (School Teachers' Qualifications) (England) Regulations 2003/1662 (as amended)",
      );

      cy.translate('professions.show.legislation.heading').then((heading) => {
        cy.get('body').should('contain', heading);
      });

      cy.translate(
        'professions.show.legislation.secondNationalLegislation',
      ).then((label) => {
        cy.get('body').should('contain', label);
      });
      cy.translate('professions.show.legislation.secondLink').then((label) => {
        cy.get('body').should('contain', label);
      });

      cy.translate('professions.show.decisions.heading').then((heading) => {
        cy.get('h2').should('not.contain', heading);
      });
    });
  });
});

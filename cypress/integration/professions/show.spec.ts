describe('Showing a profession', () => {
  it('I can view a profession', () => {
    cy.visitAndCheckAccessibility('/professions/search');
    cy.get('a').contains('Registered Trademark Attorney').click();
    cy.checkAccessibility();

    cy.translate('app.backToSearch').then((backLink) => {
      cy.get('body').should('contain', backLink);
    });

    cy.get('h1').should('contain', 'Registered Trademark Attorney');

    cy.translate('professions.show.bodies.heading').then((heading) => {
      cy.get('h2').should('contain', heading);
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

    cy.translate(
      'professions.show.qualification.otherCountriesRecognition.routes.none',
    ).then((none) => {
      cy.checkSummaryListRowValue(
        'professions.show.qualification.otherCountriesRecognition.routes.label',
        none,
      );
    });

    cy.translate('professions.show.registration.heading').then((heading) => {
      cy.get('h2').should('contain', heading);
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
      cy.get('h2').should('contain', heading);
    });
    cy.checkSummaryListRowValue(
      'professions.show.legislation.nationalLegislation',
      'The Trade Marks Act 1994',
    );

    cy.translate('professions.show.decisions.heading').then((heading) => {
      cy.get('h2').should('contain', heading);
      cy.get('h2')
        .contains(heading)
        .next()
        .within(() => {
          cy.translate('decisions.show.year').then((year) => {
            cy.get('dt').eq(0).should('contain', year);
            cy.get('dd').eq(0).should('contain', '2021');

            cy.get('dt').eq(1).should('contain', year);
            cy.get('dd').eq(1).should('contain', '2020');
          });
        });
    });
  });

  it('I can view a profession with the bare minimum fields', () => {
    cy.visitAndCheckAccessibility('/professions/no-optional-fields');

    cy.get('h1').should('contain', 'Profession with no optional fields');

    cy.translate('professions.show.bodies.heading').then((heading) => {
      cy.get('h2').should('contain', heading);
    });

    cy.translate('professions.show.bodies.heading').then((heading) => {
      cy.get('h2').should('contain', heading);
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
          .within(($div) => {
            cy.checkSummaryListRowValue(
              'professions.show.bodies.regulatedAuthority',
              'Organisation with no optional fields',
            );

            cy.translate('professions.show.bodies.address').then(
              (addressLabel) => {
                cy.wrap($div).should('not.contain', addressLabel);
              },
            );

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
            ).then((summaryHeading) => {
              cy.get('h3').should('contain', summaryHeading);

              cy.get('h3')
                .contains(summaryHeading)
                .parent()
                .within(() => {
                  cy.translate(
                    'professions.regulationTypes.accreditation.name',
                  ).then((regulationType) => {
                    cy.get('p').should('contain', regulationType);
                  });
                });
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
      cy.get('h2').should('contain', heading);

      cy.get('h2')
        .contains(heading)
        .parent()
        .within(($div) => {
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
              });
          });

          cy.translate(
            'professions.show.qualification.moreInformationUrl',
          ).then((moreInformation) => {
            cy.wrap($div).should('not.contain', moreInformation);
          });

          cy.translate('professions.show.qualification.ukHeading').then(
            (ukHeading) => {
              cy.wrap($div).should('not.contain', ukHeading);
            },
          );

          cy.translate('professions.show.qualification.ukRecognition').then(
            (ukRecognition) => {
              cy.wrap($div).should('not.contain', ukRecognition);
            },
          );

          cy.translate('professions.show.qualification.ukRecognitionUrl').then(
            (ukRecognitionUrl) => {
              cy.wrap($div).should('not.contain', ukRecognitionUrl);
            },
          );

          cy.translate(
            'professions.show.qualification.otherCountriesRecognition.summary',
          ).then((otherCountriesSummary) => {
            cy.wrap($div).should('not.contain', otherCountriesSummary);
          });

          cy.translate(
            'professions.show.qualification.otherCountriesRecognition.url',
          ).then((otherCountriesUrl) => {
            cy.wrap($div).should('not.contain', otherCountriesUrl);
          });
        });
    });

    cy.translate('professions.show.registration.heading').then((heading) => {
      cy.get('h2').should('not.contain', heading);
    });

    cy.translate('professions.show.legislation.heading').then((heading) => {
      cy.get('h2').should('contain', heading);
    });
    cy.checkSummaryListRowValue(
      'professions.show.legislation.nationalLegislation',
      "The Education (School Teachers' Qualifications) (England) Regulations 2003/1662 (as amended)",
    );

    cy.translate('professions.show.decisions.heading').then((heading) => {
      cy.get('h2').should('not.contain', heading);
    });
  });
});

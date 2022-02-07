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
    cy.checkSummaryListRowValue(
      'professions.show.bodies.regulatedAuthority',
      'Law Society of England and Wales',
    );
    cy.checkSummaryListRowValue(
      'professions.show.bodies.address',
      '456 Example Street, London, EC1 1AB',
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

    cy.translate('professions.show.regulatedActivities.heading').then(
      (heading) => {
        cy.get('body').should('contain', heading);
      },
    );
    cy.checkSummaryListRowValue(
      'professions.show.regulatedActivities.description',
      'Registration protection and exploitation of trade marks',
    );

    cy.translate('professions.show.qualification.heading').then((heading) => {
      cy.get('body').should('contain', heading);
    });
    cy.checkSummaryListRowValue(
      'professions.show.qualification.level',
      'DSE - Diploma (post-secondary education), including Annex II (ex 92/51, Annex C,D) , Art. 11 c',
    );
    cy.translate(
      'professions.methodsToObtainQualification.generalSecondaryEducation',
    ).then((method) => {
      cy.checkSummaryListRowValue(
        'professions.show.qualification.methods',
        method,
      );
    });

    cy.translate(
      'professions.methodsToObtainQualification.generalSecondaryEducation',
    ).then((method) => {
      cy.checkSummaryListRowValue(
        'professions.show.qualification.commonPath',
        method,
      );
    });

    cy.checkSummaryListRowValue(
      'professions.show.qualification.duration',
      '5.0 Year',
    );

    cy.translate('app.yes').then((value) => {
      cy.checkSummaryListRowValue(
        'professions.show.qualification.mandatoryExperience',
        value,
      );
    });

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

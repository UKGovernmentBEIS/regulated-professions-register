describe('Searching an organisation', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.translate('app.pages.index.useThisService.findContactDetails.text').then(
      (linkText) => {
        cy.contains(linkText).click();
      },
    );
  });

  it('I can view an unfiltered list of organisations', () => {
    cy.get('body').should('contain', 'Department for Education');
    cy.get('body').should('contain', 'General Medical Council');

    checkResultLength(4);
  });

  it('Organisations are sorted alphabetically', () => {
    cy.get('h2').then((elements) => {
      const names = elements.map((_, element) => element.innerText).toArray();
      cy.wrap(names).should('deep.equal', names.sort());
    });
  });

  it('I can click an organisation to be taken to its details page', () => {
    cy.get('a').contains('General Medical Council').click();
    cy.url().should(
      'contain',
      'regulatory-authorities/general-medical-council',
    );
    cy.get('body').should('contain', 'General Medical Council');
  });

  it('I can filter by nation', () => {
    cy.get('input[name="nations[]"][value="GB-SCT"]').check();

    cy.get('button').click();

    cy.get('input[name="nations[]"][value="GB-SCT"]').should('be.checked');

    cy.get('body').should('contain', 'Law Society of England and Wales');
    checkResultLength(1);
  });

  it('I can filter by industry', () => {
    cy.translate('industries.law').then((nameLabel) => {
      cy.get('label').contains(nameLabel).parent().find('input').check();
    });

    cy.get('button').click();

    cy.translate('industries.law').then((nameLabel) => {
      cy.get('label')
        .contains(nameLabel)
        .parent()
        .find('input')
        .should('be.checked');
    });

    cy.get('body').should('contain', 'Law Society of England and Wales');
    checkResultLength(1);
  });

  it('I can filter by keyword', () => {
    cy.get('input[name="keywords"]').type('Installers');

    cy.get('button').click();

    cy.get('input[name="keywords"]').should('have.value', 'Installers');

    cy.get('body').should('contain', 'Council of Registered Gas Installers');
    checkResultLength(1);
  });
});

function checkResultLength(expectedLength: number): void {
  cy.get('.govuk-grid-column-two-thirds')
    .find('h2')
    .should('have.length', expectedLength);
}

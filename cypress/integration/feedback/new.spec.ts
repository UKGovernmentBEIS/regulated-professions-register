const STRING_OVER_500 =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut congue ut velit eu posuere. Suspendisse gravida, nulla eget consectetur tempor, massa felis ullamcorper felis, id varius purus sapien non lectus. Mauris in sapien tristique, dictum mauris et, dignissim purus. In hac habitasse platea dictumst. Aliquam ut justo lacus. Praesent auctor convallis arcu id varius. Etiam convallis purus eget convallis pulvinar. Phasellus suscipit facilisis iaculis. Sed sed odio sit amet magna laoreet aliquam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos porta ante.';
const STRING_OVER_2500 = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi bibendum tincidunt purus nec porta. Vivamus eget vulputate est, quis finibus purus. Proin non ultrices magna. Duis eget suscipit risus. Fusce bibendum feugiat lorem, eleifend euismod neque hendrerit scelerisque. Phasellus ut pharetra tortor. Ut non dui at mauris porttitor ornare. Suspendisse vitae dolor neque. Donec vehicula lorem sed scelerisque blandit. Fusce rhoncus sed purus ut aliquam. Donec ipsum est, imperdiet in ultricies sed, ornare nec justo. In luctus neque at lectus tincidunt, ac pretium libero placerat.

Curabitur sit amet erat a arcu lacinia maximus non sed turpis. Duis dignissim metus est. Sed auctor dui libero, sed faucibus purus bibendum id. Etiam in sagittis metus, a pulvinar purus. Cras sollicitudin sagittis neque, ac vulputate est. Sed magna risus, facilisis at purus at, elementum rhoncus mi. Vivamus ullamcorper dui id tincidunt tincidunt. Nulla ut tellus id turpis dapibus fermentum eu sed nulla. Nullam convallis auctor erat non pellentesque. Vivamus consequat mattis arcu, id imperdiet nulla porta vitae. Phasellus vehicula turpis in metus pellentesque, vitae malesuada mi ultrices.

Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam id tincidunt libero. Cras efficitur sollicitudin augue, et tincidunt tellus semper et. Aliquam eu interdum lacus. Nulla maximus ex a lacus congue, sed congue neque gravida. Nunc lacinia scelerisque ipsum, et maximus ligula. In ligula libero, lobortis in odio quis, rutrum finibus odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris iaculis felis nec neque elementum, porttitor tempor elit consequat. Aliquam luctus rutrum lectus, ac auctor risus accumsan ut. Cras vitae ex diam. Vivamus ac malesuada eros, at molestie leo. Maecenas ac interdum leo. Donec quam orci, pulvinar et ante a, condimentum fermentum ligula. Praesent eget arcu ornare ex ultrices lobortis ut eu arcu. Praesent non augue vel lorem sagittis suscipit.

Nunc maximus finibus metus ut elementum. Phasellus vulputate quis turpis vitae scelerisque. Quisque pulvinar, augue id laoreet finibus, nulla enim dictum neque, cursus ullamcorper lectus nibh non odio. Proin nec ultricies dui. Aliquam at justo condimentum, auctor dui in, commodo mi. Nunc sit amet sollicitudin nulla, quis viverra metus. In feugiat eros nunc. Proin aliquet in est mollis commodo. Sed semper ipsum at eros porttitor, sit amet gravida leo ullamcorper. Nam eu dolor et nisl egestas porttitor.

Integer consequat magna justo, ut fringilla lorem elementum vel. Nunc non auctor diam. Mauris tortor.`;

describe('/feedback/', () => {
  it('Shows the feedback page', () => {
    cy.visit('/feedback/');

    // Conditional radio buttons add an additional `aria-expanded` field,
    // so ignore that rule on this page
    cy.checkAccessibility({ 'aria-allowed-attr': { enabled: false } });

    cy.translate('feedback.new.title').then((title) => {
      cy.get('body').should('contain', title);
    });
  });

  context('When click the back button on the feedback page', () => {
    it('It returns to the previous page', () => {
      let startingUrl = '/professions/search';

      cy.visit(startingUrl);

      cy.get('[id="feedback-link"').click();
      cy.url().should('contain', 'feedback');

      cy.get('a').contains('Back').click();
      cy.url().should('contain', startingUrl);
    });
  });
});

describe('Submitting new feedback', () => {
  beforeEach(() => {
    cy.visit('/feedback/');
  });
  context('When I submit initial form with no inputs', () => {
    it('Displays an error', () => {
      submitFeedbackForm();

      cy.translate('feedback.errors.feedbackOrTechnical.empty').then(
        (error) => {
          cy.get('body').should('contain', error);
        },
      );
    });
  });
  context('When I submit feedback with all empty inputs', () => {
    it('The correct errors are displayed', () => {
      selectOptionByLabel('feedback.questions.feedbackOrTechnical.answers.no');

      submitFeedbackForm();

      cy.translate('feedback.errors.satisfaction.empty').then((error) => {
        cy.get('[id="satisfaction-error"]').should('contain', error);
      });
      cy.translate('feedback.errors.improvements.empty').then((error) => {
        cy.get('[id="improvements-error"]').should('contain', error);
      });
      cy.translate('feedback.errors.visitReason.empty').then((error) => {
        cy.get('[id="visitReason-error"]').should('contain', error);
      });
      cy.translate('feedback.errors.contactAuthority.empty').then((error) => {
        cy.get('[id="contactAuthority-error"]').should('contain', error);
      });
      cy.translate('feedback.errors.betaSurveyYesNo.empty').then((error) => {
        cy.get('[id="betaSurveyYesNo-error"]').should('contain', error);
      });
    });
  });
  context('When I submit feedback with empty conditional inputs', () => {
    it('The correct errors are displayed', () => {
      selectOptionByLabel('feedback.questions.feedbackOrTechnical.answers.no');
      selectOptionByLabel('feedback.questions.satisfaction.answers.neutral');
      cy.get('[id="improvements"]').type('Lorem ipsum');
      selectOptionByLabel('feedback.questions.visitReason.answers.other');
      cy.get('[id="contactAuthority-3"').click();
      cy.get('[id="betaSurveyYesNo"').click();

      submitFeedbackForm();

      cy.translate('feedback.errors.visitReasonOther.empty').then((error) => {
        cy.get('[id="visit-reason-other-error"]').should('contain', error);
      });
      cy.translate('feedback.errors.contactAuthorityNoReason.empty').then(
        (error) => {
          cy.get('[id="contact-authority-no-reason-error"]').should(
            'contain',
            error,
          );
        },
      );
      cy.translate('feedback.errors.betaSurveyEmail.empty').then((error) => {
        cy.get('[id="beta-survey-email-error"]').should('contain', error);
      });
    });
  });

  context('When I submit feedback with required information', () => {
    it('The feedback form will submit and display the thank you page.', () => {
      selectOptionByLabel('feedback.questions.feedbackOrTechnical.answers.no');
      selectOptionByLabel('feedback.questions.satisfaction.answers.neutral');
      cy.get('[id="improvements"]').type('Lorem ipsum');
      selectOptionByLabel('feedback.questions.visitReason.answers.1');
      selectOptionByLabel(
        'feedback.questions.contactAuthority.answers.yesPhoneEmail',
      );
      cy.get('[id="betaSurveyYesNo-2"').click();

      submitFeedbackForm();

      cy.checkAccessibility();

      cy.translate('feedback.sent.title').then((title) => {
        cy.get('body').should('contain', title);
      });
    });
  });

  context(
    'When I submit feedback with required information and click the back button',
    () => {
      it('I am returned to the previous page', () => {
        let startingUrl = '/regulatory-authorities/search';

        cy.visit(startingUrl);

        cy.get('[id="feedback-link"').click();
        cy.url().should('contain', 'feedback');

        selectOptionByLabel(
          'feedback.questions.feedbackOrTechnical.answers.no',
        );
        selectOptionByLabel('feedback.questions.satisfaction.answers.neutral');
        cy.get('[id="improvements"]').type('Lorem ipsum');
        selectOptionByLabel('feedback.questions.visitReason.answers.1');
        selectOptionByLabel(
          'feedback.questions.contactAuthority.answers.yesPhoneEmail',
        );
        cy.get('[id="betaSurveyYesNo-2"').click();

        submitFeedbackForm();

        cy.checkAccessibility();

        cy.translate('feedback.sent.title').then((title) => {
          cy.get('body').should('contain', title);
        });

        cy.get('a').contains('Back').click();
        cy.url().should('contain', startingUrl);
      });
    },
  );

  context(
    'When I submit a technical problem with empty conditional inputs',
    () => {
      it('The correct errors are displayed', () => {
        selectOptionByLabel(
          'feedback.questions.feedbackOrTechnical.answers.yes',
        );
        selectOptionByLabel(
          'feedback.questions.problemArea.answers.specificPage',
        );
        cy.get('[id="problem-area-description"]').type('Lorem ipsum');

        submitFeedbackForm();

        cy.translate('feedback.errors.problemAreaPage.empty').then((error) => {
          cy.get('[id="problem-area-page-error"]').should('contain', error);
        });
      });
    },
  );

  context('When I submit a technical problem with required information', () => {
    it('The feedback form will submit and display the thank you page.', () => {
      selectOptionByLabel('feedback.questions.feedbackOrTechnical.answers.yes');
      selectOptionByLabel(
        'feedback.questions.problemArea.answers.specificPage',
      );
      cy.get('[id="problem-area-page"]').type('/cookies');
      cy.get('[id="problem-area-description"]').type('Lorem ipsum');

      submitFeedbackForm();

      cy.checkAccessibility();

      cy.checkAccessibility();

      cy.translate('feedback.sent.title').then((title) => {
        cy.get('body').should('contain', title);
      });
    });
  });

  context(
    'When I submit feedback with input fields exceeding maximum lengths',
    () => {
      it('The correct errors are displayed', () => {
        selectOptionByLabel(
          'feedback.questions.feedbackOrTechnical.answers.no',
        );
        selectOptionByLabel('feedback.questions.satisfaction.answers.neutral');

        //using val as type is far too slow for large string
        cy.get('[id="improvements"]').invoke('val', STRING_OVER_2500);
        selectOptionByLabel('feedback.questions.visitReason.answers.other');
        cy.get('[id="visit-reason-other"]').invoke('val', STRING_OVER_500);
        cy.get('[id="contactAuthority-3"').click();
        cy.get('[id="contact-authority-no-reason"]').invoke(
          'val',
          STRING_OVER_2500,
        );
        cy.get('[id="betaSurveyYesNo"').click();
        cy.get('[id="beta-survey-email"]').invoke('val', STRING_OVER_500);

        submitFeedbackForm();

        cy.translate('feedback.errors.improvements.long').then((error) => {
          cy.get('[id="improvements-error"]').should('contain', error);
        });
        cy.translate('feedback.errors.visitReasonOther.long').then((error) => {
          cy.get('[id="visit-reason-other-error"]').should('contain', error);
        });
        cy.translate('feedback.errors.contactAuthorityNoReason.long').then(
          (error) => {
            cy.get('[id="contact-authority-no-reason-error"]').should(
              'contain',
              error,
            );
          },
        );
        cy.translate('feedback.errors.betaSurveyEmail.long').then((error) => {
          cy.get('[id="beta-survey-email-error"]').should('contain', error);
        });
      });
    },
  );

  context(
    'When I submit a technical issue with input fields exceeding maximum lengths',
    () => {
      it('The correct errors are displayed', () => {
        selectOptionByLabel(
          'feedback.questions.feedbackOrTechnical.answers.yes',
        );

        //using val as type is far too slow for large string
        cy.get('[id="problem-area-page"]').invoke('val', STRING_OVER_500);
        selectOptionByLabel(
          'feedback.questions.problemArea.answers.specificPage',
        );
        cy.get('[id="problem-area-description"]').invoke(
          'val',
          STRING_OVER_2500,
        );
        submitFeedbackForm();

        cy.translate('feedback.errors.problemAreaPage.long').then((error) => {
          cy.get('[id="problem-area-page-error"]').should('contain', error);
        });
        cy.translate('feedback.errors.problemDescription.long').then(
          (error) => {
            cy.get('[id="problem-area-description-error"]').should(
              'contain',
              error,
            );
          },
        );
      });
    },
  );
});

function selectOptionByLabel(i188nPath: string) {
  cy.translate(i188nPath).then((input) => {
    cy.get('label').contains(input).click();
  });
}

function submitFeedbackForm() {
  cy.translate('feedback.submit').then((submit) => {
    cy.get('button').contains(submit).click();
  });
}

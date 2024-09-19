import { getUnixTime } from 'date-fns';
import { translate } from '../plugins/i18n';

import puppeteer from 'puppeteer';
import { AxeRules } from '.';
import path from 'path';
import { parse } from 'csv-parse/browser/esm/sync';

/*
 * Get a username and password from their role
 */
function getUser(role: string): { username: string; password: string } {
  const users = {
    admin: {
      username: Cypress.env('ADMIN_USERNAME'),
      password: Cypress.env('ADMIN_PASSWORD'),
    },
    registrar: {
      username: Cypress.env('REGISTRAR_USERNAME'),
      password: Cypress.env('REGISTRAR_PASSWORD'),
    },
    editor: {
      username: Cypress.env('EDITOR_USERNAME'),
      password: Cypress.env('EDITOR_PASSWORD'),
    },
    orgadmin: {
      username: Cypress.env('ORGADMIN_USERNAME'),
      password: Cypress.env('ORGADMIN_PASSWORD'),
    },
    orgeditor: {
      username: Cypress.env('ORGEDITOR_USERNAME'),
      password: Cypress.env('ORGEDITOR_PASSWORD'),
    },
  };

  return users[role];
}

/*
 * Create the cookie expiration.
 */
function getFutureTime(minutesInFuture: number): number {
  const time = new Date(new Date().getTime() + minutesInFuture * 60000);
  return getUnixTime(time);
}

/**
 * Create a cookie object.
 * @param {*} cookie
 */
function createCookie(cookie: puppeteer.Protocol.Network.Cookie) {
  return {
    name: cookie.name,
    value: cookie.value,
    options: {
      domain: `${cookie.domain.trimLeft()}`,
      expiry: getFutureTime(15),
      httpOnly: cookie.httpOnly,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      session: cookie.session,
    },
  };
}

/**
 * Login via puppeteer and return the redirect url and cookies.
 */
function login(role: string) {
  const { username, password } = getUser(role);
  return cy.task('LoginPuppeteer', {
    username: username,
    password: password,
    loginUrl: 'http://localhost:3000/login',
    callbackUrl: 'http://localhost:3000/callback',
  });
}

/**
 * Login with Auth0.
 */
Cypress.Commands.add('loginAuth0', (user = 'admin') => {
  // For organisation level users, we use a cache-breaker string to prevent
  // a stale user organisation being used across database refreshes
  const sessionName = user.startsWith('org') ? crypto.randomUUID() : 'default';

  return cy.session(`logged as user ${user} (${sessionName})`, () => {
    login(user).then(({ cookies, callbackUrl }) => {
      cookies
        .map(createCookie)
        .forEach((c: any) => cy.setCookie(c.name, c.value, c.options));

      cy.visit(callbackUrl);
    });
  });
});

Cypress.Commands.add(
  'translate',
  (translation: string, personalisations: object = {}) => {
    return translate(translation, personalisations);
  },
);

/**
 * Check a form element's value
 */

Cypress.Commands.add('checkInputValue', (label: string, value: string) => {
  return cy.translate(label).then((formLabel) => {
    cy.get('body').should('contain', formLabel);
    cy.get('label')
      .contains(formLabel)
      .siblings('input')
      .then(($input) => {
        cy.wrap($input).should('have.value', value);
      });
  });
});

Cypress.Commands.add('checkTextareaValue', (label: string, value: string) => {
  return cy.translate(label).then((formLabel) => {
    cy.get('body').should('contain', formLabel);
    cy.get('label')
      .contains(formLabel)
      .siblings('textarea')
      .then(($textarea) => {
        cy.wrap($textarea).should('contain', value);
      });
  });
});

Cypress.Commands.add(
  'checkSummaryListRowValue',
  (key: string, value: string) => {
    return cy.translate(key).then((label) => {
      cy.get('.govuk-summary-list__key')
        .contains(label)
        .siblings('.govuk-summary-list__value')
        .then(($summaryListValue) => {
          cy.wrap($summaryListValue).should('contain', value);
        });
    });
  },
);

Cypress.Commands.add(
  'checkSummaryListRowValueFromSelector',
  (selector: string, value: string) => {
    cy.get(`${selector} .govuk-summary-list__key`)
      .siblings('.govuk-summary-list__value')
      .then(($summaryListValue) => {
        cy.wrap($summaryListValue).should('contain', value);
      });
  },
);

Cypress.Commands.add(
  'checkSummaryListRowMultilineValue',
  (key: string, lines: string[]) => {
    return cy.translate(key).then((label) => {
      cy.get('.govuk-summary-list__key')
        .contains(label)
        .siblings('.govuk-summary-list__value')
        .within(() => {
          cy.get('p').should('have.html', lines.join('<br>'));
        });
    });
  },
);

Cypress.Commands.add(
  'checkSummaryListRowList',
  (key: string, listItems: string[]) => {
    return cy.translate(key).then((label) => {
      cy.get('.govuk-summary-list__key')
        .contains(label)
        .siblings('.govuk-summary-list__value')
        .within(() => {
          cy.get('ul li').should('have.length', listItems.length);
          listItems.forEach((listItem) =>
            cy.get('ul li').should('contain', listItem),
          );
        });
    });
  },
);

Cypress.Commands.add('clickSummaryListRowChangeLink', (key: string) => {
  return cy.translate(key).then((label) => {
    cy.translate('app.change').then((changeLabel) => {
      cy.get('.govuk-summary-list__key')
        .contains(label)
        .siblings('.govuk-summary-list__actions')
        .then(($summaryListValue) => {
          cy.wrap($summaryListValue).within(() => {
            cy.contains(changeLabel).click();
          });
        });
    });
  });
});

Cypress.Commands.add(
  'checkCorrectNumberOfProfessionsAreShown',
  (statuses: ('live' | 'archived' | 'draft')[]) => {
    cy.readFile('./seeds/test/professions.json').then((professions) => {
      const professionsToShow = professions.filter((profession) =>
        profession.versions.some((version) =>
          statuses.includes(version.status),
        ),
      );

      cy.translate('professions.search.foundPlural', {
        count: professionsToShow.length,
      }).then((foundText) => {
        cy.get('body').should('contain', foundText);
      });
    });
  },
);

Cypress.Commands.add(
  'checkCorrectNumberOfOrganisationsAreShown',
  (statuses: ('live' | 'archived' | 'draft')[]) => {
    cy.readFile('./seeds/test/organisations.json').then((organisations) => {
      const organisationsToShow = organisations.filter((organisation) =>
        organisation.versions.some((version) =>
          statuses.includes(version.status),
        ),
      );

      cy.translate('organisations.search.foundPlural', {
        count: organisationsToShow.length,
      }).then((foundText) => {
        cy.get('body').should('contain', foundText);
      });
    });
  },
);

Cypress.Commands.add(
  'checkPublishBlocked',
  (
    incompleteSections: string[],
    organisationsNotLive: string[],
    shouldHaveButton = true,
  ) => {
    return cy
      .translate('professions.admin.publish.blocked.heading')
      .then((heading) => {
        cy.get('h2')
          .contains(heading)
          .parent()
          .within(() => {
            cy.get('li').should(
              'have.length',
              incompleteSections.length + organisationsNotLive.length,
            );

            incompleteSections.forEach((incompleteSection) => {
              cy.translate(
                `professions.form.headings.${incompleteSection}`,
              ).then((section) => {
                cy.translate(
                  `professions.admin.publish.blocked.incompleteSection`,
                  {
                    section,
                  },
                ).then((blockerText) => {
                  cy.get('li').should('contain', blockerText);
                });
              });
            });

            organisationsNotLive.forEach((organisationNotLive) => {
              cy.translate(
                `professions.admin.publish.blocked.organisationNotLive`,
                {
                  organisation: organisationNotLive,
                },
              ).then((blockerText) => {
                cy.get('li').should('contain', blockerText);
              });
            });
          });

        cy.translate('professions.form.button.publish').then((publishLabel) => {
          if (shouldHaveButton) {
            cy.get('button')
              .contains(publishLabel)
              .should('have.class', 'govuk-button--disabled');
          } else {
            cy.root().should('not.contain', publishLabel);
          }
        });
      });
  },
);

Cypress.Commands.add('checkPublishNotBlocked', () => {
  return cy
    .translate('professions.admin.publish.blocked.heading')
    .then((heading) => {
      cy.get('body').should('not.contain', heading);

      cy.translate('professions.form.button.publish').then((publishLabel) => {
        cy.get('a')
          .contains(publishLabel)
          .should('not.have.class', 'govuk-button--disabled');
      });
    });
});

Cypress.Commands.add(
  'checkVerticalTable',
  (headings: string[], rows: string[][]) => {
    headings.forEach((heading, index) => {
      cy.translate(heading).then((translatedHeading) => {
        cy.get('table thead tr th')
          .eq(index)
          .should('contain', translatedHeading);
      });
    });

    rows.forEach((row, rowIndex) => {
      cy.get('table tbody tr')
        .eq(rowIndex)
        .within(() => {
          row.forEach((cell, cellIndex) => {
            cy.get('td').eq(cellIndex).should('contain', cell);
          });
        });
    });
  },
);

Cypress.Commands.add(
  'checkHorizontalTable',
  (headings: string[], columns: string[][]) => {
    headings.forEach((heading, index) => {
      cy.translate(heading).then((translatedHeading) => {
        cy.get('table tr')
          .eq(index)
          .within(() => {
            cy.get('th').should('contain', translatedHeading);
          });
      });
    });

    columns.forEach((column, columnIndex) => {
      column.forEach((cell, cellIndex) => {
        cy.get('table tbody tr')
          .eq(cellIndex)
          .within(() => {
            cy.get('td').eq(columnIndex).should('contain', cell);
          });
      });
    });
  },
);

Cypress.Commands.add('visitAndCheckAccessibility', (url: string) => {
  cy.visit(url);
  cy.checkAccessibility();
});

Cypress.Commands.add('checkAccessibility', (rules: AxeRules = undefined) => {
  cy.injectAxe();

  cy.checkA11y({ exclude: [['#phase-banner-container']] }, { rules: rules });
});

Cypress.Commands.add('visitInternalDashboard', () => {
  cy.visitAndCheckAccessibility('/admin/dashboard');
});

Cypress.Commands.add('clickFilterButtonAndCheckAccessibility', () => {
  cy.translate('app.filters.filterButton').then((buttonLabel) => {
    cy.get('button').contains(buttonLabel).click();
  });

  cy.checkAccessibility();
});

Cypress.Commands.add('expandFilters', (prefix: string) => {
  cy.translate(`${prefix}.showFilters`).then((showFilters) => {
    cy.get('span').contains(showFilters).click();
  });
});

Cypress.Commands.add('getDisplayedDatasets', () => {
  return cy
    .readFile('./seeds/test/decision-datasets.json')
    .then((datasets: SeedDecisionDataset[]) => {
      const result = datasets.filter((dataset) =>
        ['live', 'draft'].includes(dataset.status),
      );

      result.sort((dataset1, dataset2) => {
        const professionComparison = dataset1.profession.localeCompare(
          dataset2.profession,
        );

        if (professionComparison) {
          return professionComparison;
        }

        const organisationComparison = dataset1.organisation.localeCompare(
          dataset2.organisation,
        );

        if (organisationComparison) {
          return organisationComparison;
        }

        return dataset2.year - dataset1.year;
      });

      return result;
    });
});

Cypress.Commands.add(
  'checkCsvDownload',
  (
    downloadText: string,
    filename: string,
    filter: (dataset: SeedDecisionDataset) => boolean,
  ) => {
    cy.get('body a').contains(downloadText).click();

    const filePath = path.join(
      Cypress.config('downloadsFolder'),
      `${filename}.csv`,
    );

    cy.readFile(filePath).then((file) => {
      const rows: string[][] = parse(file);

      cy.getDisplayedDatasets().then((datasets) => {
        datasets = datasets.filter(filter);

        const countries = datasets
          .flatMap((dataset) => dataset.routes)
          .flatMap((route) => route.countries);

        expect(rows).to.have.length(countries.length + 1);
      });
    });
  },
);

Cypress.Commands.add('clickContinueAndCheckBackLink', () => {
  cy.url().then((url) => {
    cy.translate('app.continue').then((continueLabel) => {
      cy.get('button').contains(continueLabel).click();
      cy.translate('app.back').then((back) => {
        cy.get('a').contains(back).click();
        cy.url().should('equal', url);
        cy.get('button').contains(continueLabel).click();
      });
    });
  });
  cy.checkAccessibility();
});

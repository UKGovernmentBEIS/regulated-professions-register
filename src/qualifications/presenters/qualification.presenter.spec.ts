import qualificationFactory from '../../testutils/factories/qualification';
import organisationFactory from '../../testutils/factories/organisation';
import QualificationPresenter from './qualification.presenter';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { multilineOf } from '../../testutils/multiline-of';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { formatLink } from '../../helpers/format-link.helper';
import { linkOf } from '../../testutils/link-of';
import { OtherCountriesRecognitionRoutes } from '../qualification.entity';

jest.mock('../../helpers/format-multiline-string.helper');
jest.mock('../../helpers/format-link.helper');

describe(QualificationPresenter, () => {
  describe('when the Qualification is defined', () => {
    describe('routesToObtain', () => {
      it('returns the a multiline string of the text value', () => {
        (formatMultilineString as jest.Mock).mockImplementation(multilineOf);

        const qualification = qualificationFactory.build({
          routesToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.routesToObtain).toEqual(multilineOf('other value'));

        expect(formatMultilineString).toBeCalledWith('other value');
      });
    });

    describe('moreInformationUrl', () => {
      it('returns a link', () => {
        (formatLink as jest.Mock).mockImplementation(linkOf);

        const qualification = qualificationFactory.build({
          url: 'http://example.com',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.moreInformationUrl).toEqual(
          linkOf('http://example.com'),
        );
      });
    });

    describe('adminSelectedOtherCountriesRecognitionRoutes', () => {
      describe('when other routes are set', () => {
        it('returnsthe route', () => {
          const qualification = qualificationFactory.build({
            otherCountriesRecognitionRoutes:
              OtherCountriesRecognitionRoutes.All,
          });

          const presenter = new QualificationPresenter(
            qualification,
            createMockI18nService(),
          );

          expect(
            presenter.adminSelectedOtherCountriesRecognitionRoutes,
          ).toEqual(OtherCountriesRecognitionRoutes.All);
        });
      });

      describe('when other countries routes are not set', () => {
        it('returns null', () => {
          const qualification = qualificationFactory.build({
            otherCountriesRecognitionRoutes: null,
          });

          const presenter = new QualificationPresenter(
            qualification,
            createMockI18nService(),
          );

          expect(
            presenter.adminSelectedOtherCountriesRecognitionRoutes,
          ).toEqual(null);
        });
      });
    });

    describe('publicOtherCountriesRecognitionRoutes', () => {
      describe('when other routes are set', () => {
        it('returns a localisation id with the route', () => {
          const qualification = qualificationFactory.build({
            otherCountriesRecognitionRoutes:
              OtherCountriesRecognitionRoutes.All,
          });

          const presenter = new QualificationPresenter(
            qualification,
            createMockI18nService(),
          );

          expect(presenter.publicOtherCountriesRecognitionRoutes).toEqual(
            OtherCountriesRecognitionRoutes.All,
          );
        });
      });

      describe('when other countries routes are not set', () => {
        it('returns null', () => {
          const qualification = qualificationFactory.build({
            otherCountriesRecognitionRoutes: null,
          });

          const presenter = new QualificationPresenter(
            qualification,
            createMockI18nService(),
          );

          expect(
            presenter.adminSelectedOtherCountriesRecognitionRoutes,
          ).toEqual(null);
        });
      });
    });

    describe('ukRecognitionUrl', () => {
      it('returns a link', () => {
        (formatLink as jest.Mock).mockImplementation(linkOf);

        const qualification = qualificationFactory.build({
          ukRecognitionUrl: 'http://example.com',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.ukRecognitionUrl).toEqual(
          linkOf('http://example.com'),
        );
      });
    });

    describe('summaryList', () => {
      describe('when a Qualification has all fields', () => {
        describe('when the Qualifications are from a UK profession', () => {
          it('returns a summary list of all relevant Qualification fields', async () => {
            (formatMultilineString as jest.Mock).mockImplementation(
              multilineOf,
            );
            (formatLink as jest.Mock).mockImplementation((link) =>
              link ? linkOf(link) : '',
            );

            const qualification = qualificationFactory.build();

            const presenter = new QualificationPresenter(
              qualification,
              createMockI18nService(),
            );

            await expect(presenter.summaryList(true, false)).resolves.toEqual({
              overviewSummaryList: {
                classes: 'govuk-summary-list--no-border',
                rows: [
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.routesToObtain',
                      ),
                    },
                    value: {
                      html: presenter.routesToObtain,
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.moreInformationUrl',
                      ),
                    },
                    value: {
                      html: presenter.moreInformationUrl,
                    },
                  },
                ],
              },
              otherCountriesSummaryList: {
                classes: 'govuk-summary-list--no-border',
                rows: [
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.routes.label',
                      ),
                    },
                    value: {
                      text: translationOf(
                        `professions.show.qualification.otherCountriesRecognition.routes.${presenter.publicOtherCountriesRecognitionRoutes}`,
                      ),
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.summary',
                      ),
                    },
                    value: {
                      html: presenter.otherCountriesRecognitionSummary,
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.url',
                      ),
                    },
                    value: {
                      html: presenter.otherCountriesRecognitionUrl,
                    },
                  },
                ],
              },
              ukSummaryList: null,
            });
          });
        });
        describe('when the Qualifications are from a non-UK profession', () => {
          it('returns a summary list of all relevant Qualification fields', async () => {
            (formatMultilineString as jest.Mock).mockImplementation(
              multilineOf,
            );
            (formatLink as jest.Mock).mockImplementation((link) =>
              link ? linkOf(link) : '',
            );

            const qualification = qualificationFactory.build({
              ukRecognition: 'UK recognition',
              ukRecognitionUrl: 'http://example.com/uk',
            });

            const presenter = new QualificationPresenter(
              qualification,
              createMockI18nService(),
            );

            await expect(presenter.summaryList(true, true)).resolves.toEqual({
              overviewSummaryList: {
                classes: 'govuk-summary-list--no-border',
                rows: [
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.routesToObtain',
                      ),
                    },
                    value: {
                      html: presenter.routesToObtain,
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.moreInformationUrl',
                      ),
                    },
                    value: {
                      html: presenter.moreInformationUrl,
                    },
                  },
                ],
              },
              ukSummaryList: {
                classes: 'govuk-summary-list--no-border',
                rows: [
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.ukRecognition',
                      ),
                    },
                    value: {
                      html: presenter.ukRecognition,
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.ukRecognitionUrl',
                      ),
                    },
                    value: {
                      html: presenter.ukRecognitionUrl,
                    },
                  },
                ],
              },
              otherCountriesSummaryList: {
                classes: 'govuk-summary-list--no-border',
                rows: [
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.routes.label',
                      ),
                    },
                    value: {
                      text: translationOf(
                        `professions.show.qualification.otherCountriesRecognition.routes.${presenter.publicOtherCountriesRecognitionRoutes}`,
                      ),
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.summary',
                      ),
                    },
                    value: {
                      html: presenter.otherCountriesRecognitionSummary,
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.url',
                      ),
                    },
                    value: {
                      html: presenter.otherCountriesRecognitionUrl,
                    },
                  },
                ],
              },
            });
          });
        });
      });

      describe('when a Qualification is missing fields', () => {
        describe('when `showEmptyFields` is true', () => {
          it('returns summary lists of all Qualification fields', async () => {
            (formatMultilineString as jest.Mock).mockImplementation(
              multilineOf,
            );
            (formatLink as jest.Mock).mockImplementation((link) =>
              link ? linkOf(link) : '',
            );

            const qualification = qualificationFactory.build({
              url: '',
              otherCountriesRecognitionRoutes: null,
            });

            const presenter = new QualificationPresenter(
              qualification,
              createMockI18nService(),
            );

            await expect(presenter.summaryList(true, false)).resolves.toEqual({
              overviewSummaryList: {
                classes: 'govuk-summary-list--no-border',
                rows: [
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.routesToObtain',
                      ),
                    },
                    value: {
                      html: presenter.routesToObtain,
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.moreInformationUrl',
                      ),
                    },
                    value: {
                      html: presenter.moreInformationUrl,
                    },
                  },
                ],
              },
              otherCountriesSummaryList: {
                classes: 'govuk-summary-list--no-border',
                rows: [
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.routes.label',
                      ),
                    },
                    value: {
                      text: null,
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.summary',
                      ),
                    },
                    value: {
                      html: presenter.otherCountriesRecognitionSummary,
                    },
                  },
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.otherCountriesRecognition.url',
                      ),
                    },
                    value: {
                      html: presenter.otherCountriesRecognitionUrl,
                    },
                  },
                ],
              },
              ukSummaryList: null,
            });
          });
        });
        describe('when `showEmptyFields` is false', () => {
          it('returns summary lists of all non-empty Qualification fields', async () => {
            (formatMultilineString as jest.Mock).mockImplementation(
              multilineOf,
            );
            (formatLink as jest.Mock).mockImplementation((link) =>
              link ? linkOf(link) : '',
            );

            const qualification = qualificationFactory.build({
              url: '',
              otherCountriesRecognitionRoutes: null,
            });

            const presenter = new QualificationPresenter(
              qualification,
              createMockI18nService(),
            );

            await expect(presenter.summaryList(false, false)).resolves.toEqual({
              overviewSummaryList: {
                classes: 'govuk-summary-list--no-border',
                rows: [
                  {
                    key: {
                      text: translationOf(
                        'professions.show.qualification.routesToObtain',
                      ),
                    },
                    value: {
                      html: presenter.routesToObtain,
                    },
                  },
                ],
              },
              otherCountriesSummaryList: null,
              ukSummaryList: null,
            });
          });
        });
      });

      describe('when awarding bodies are present', () => {
        it('adds a list of awarding bodies', async () => {
          const qualification = qualificationFactory.build({
            url: '',
            otherCountriesRecognitionRoutes: null,
          });
          const organisations = organisationFactory.buildList(3);

          const presenter = new QualificationPresenter(
            qualification,
            createMockI18nService(),
            organisations,
          );

          const summaryList = await presenter.summaryList(true, false);
          const awardingBodyRole = summaryList.overviewSummaryList.rows.find(
            (r) =>
              r.key['text'] ===
              translationOf('professions.show.qualification.awardingBodies'),
          );
          const html = awardingBodyRole.value['html'];

          expect(html).toMatch('<ul class="govuk-list">');

          expect(html).toMatch('</ul>');

          for (const organisation of organisations) {
            expect(html).toMatch(
              `<li><a class="govuk-link" href="/regulatory-authorities/${organisation.slug}">${organisation.name}</a></li>`,
            );
          }
        });
      });
    });
  });

  describe('when the Qualification is undefined', () => {
    it('presents empty values', () => {
      (formatMultilineString as jest.Mock).mockImplementation(multilineOf);
      (formatLink as jest.Mock).mockImplementation(linkOf);

      expect(
        new QualificationPresenter(undefined, createMockI18nService()),
      ).toEqual(
        expect.objectContaining({
          routesToObtain: multilineOf(undefined),
          moreInformationUrl: linkOf(undefined),
          qualification: undefined,
          ukRecognition: multilineOf(undefined),
          ukRecognitionUrl: linkOf(undefined),
          adminSelectedOtherCountriesRecognitionRoutes: undefined,
          publicOtherCountriesRecognitionRoutes: undefined,
          otherCountriesRecognitionSummary: multilineOf(undefined),
          otherCountriesRecognitionUrl: linkOf(undefined),
        }),
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

import qualificationFactory from '../../testutils/factories/qualification';
import QualificationPresenter from './qualification.presenter';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { multilineOf } from '../../testutils/multiline-of';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { formatLink } from '../../helpers/format-link.helper';
import { linkOf } from '../../testutils/link-of';

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

    describe('otherCountriesRecognitionUrl', () => {
      it('returns a link', () => {
        (formatLink as jest.Mock).mockImplementation(linkOf);

        const qualification = qualificationFactory.build({
          otherCountriesRecognitionUrl: 'http://example.com',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.otherCountriesRecognitionUrl).toEqual(
          linkOf('http://example.com'),
        );
      });
    });

    describe('summaryList', () => {
      describe('when a Qualification has all fields', () => {
        it('returns a summary list of all Qualification fields', async () => {
          const qualification = qualificationFactory.build({
            otherCountriesRecognitionUrl: 'http://example.com',
          });

          const presenter = new QualificationPresenter(
            qualification,
            createMockI18nService(),
          );

          await expect(presenter.summaryList(true)).resolves.toEqual({
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
          });
        });
      });

      describe('when a Qualification is missing fields', () => {
        describe('when `showEmptyFields` is true', () => {
          it('returns a summary list of all Qualification fields', async () => {
            const qualification = qualificationFactory.build({
              otherCountriesRecognitionUrl: 'http://example.com',
              url: '',
            });

            const presenter = new QualificationPresenter(
              qualification,
              createMockI18nService(),
            );

            await expect(presenter.summaryList(true)).resolves.toEqual({
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
            });
          });
        });
        describe('when `showEmptyFields` is false', () => {
          it('returns a summary list of all non-empty Qualification fields', async () => {
            const qualification = qualificationFactory.build({
              otherCountriesRecognitionUrl: 'http://example.com',
              url: '',
            });

            const presenter = new QualificationPresenter(
              qualification,
              createMockI18nService(),
            );

            await expect(presenter.summaryList(false)).resolves.toEqual({
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
                undefined,
              ],
            });
          });
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
          otherCountriesRecognition: undefined,
          otherCountriesRecognitionUrl: linkOf(undefined),
          qualification: undefined,
          ukRecognition: undefined,
          ukRecognitionUrl: linkOf(undefined),
        }),
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

import qualificationFactory from '../../testutils/factories/qualification';
import QualificationPresenter from './qualification.presenter';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { multilineOf } from '../../testutils/multiline-of';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';

jest.mock('../../helpers/format-multiline-string.helper');

describe(QualificationPresenter, () => {
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

  describe('mostCommonRouteToObtain', () => {
    it('returns the a multiline string of the text value', () => {
      (formatMultilineString as jest.Mock).mockImplementation(multilineOf);

      const qualification = qualificationFactory.build({
        mostCommonRouteToObtain: 'other value',
      });

      const presenter = new QualificationPresenter(
        qualification,
        createMockI18nService(),
      );

      expect(presenter.mostCommonRouteToObtain).toEqual(
        multilineOf('other value'),
      );

      expect(formatMultilineString).toBeCalledWith('other value');
    });
  });

  describe('mandatoryProfessionalExperience', () => {
    describe('when true', () => {
      it('returns the localisation id for "Yes"', () => {
        const qualification = qualificationFactory.build({
          mandatoryProfessionalExperience: true,
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.mandatoryProfessionalExperience).toEqual('app.yes');
      });
    });

    describe('when false', () => {
      it('returns the localisation id for "No"', () => {
        const qualification = qualificationFactory.build({
          mandatoryProfessionalExperience: false,
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.mandatoryProfessionalExperience).toEqual('app.no');
      });
    });

    describe('when not set at all on a blank Qualification', () => {
      it('returns an empty string', () => {
        const qualification = qualificationFactory.build({
          mandatoryProfessionalExperience: null,
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.mandatoryProfessionalExperience).toEqual('');
      });
    });
  });

  describe('moreInformationUrl', () => {
    describe('when a blank string is provided', () => {
      it('returns null', () => {
        const qualification = qualificationFactory.build({
          url: '',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.moreInformationUrl).toEqual(null);
      });
    });
    describe('when a URL is provided', () => {
      it('returns a link', () => {
        const qualification = qualificationFactory.build({
          url: 'http://example.com',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.moreInformationUrl).toEqual(
          '<a class="govuk-link" href="http://example.com">http://example.com</a>',
        );
      });
    });
  });

  describe('ukRecognitionUrl', () => {
    describe('when a blank string is provided', () => {
      it('returns null', () => {
        const qualification = qualificationFactory.build({
          ukRecognitionUrl: '',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.ukRecognitionUrl).toEqual(null);
      });
    });
    describe('when a URL is provided', () => {
      it('returns a link', () => {
        const qualification = qualificationFactory.build({
          ukRecognitionUrl: 'http://example.com',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.ukRecognitionUrl).toEqual(
          '<a class="govuk-link" href="http://example.com">http://example.com</a>',
        );
      });
    });
  });

  describe('otherCountriesRecognitionUrl', () => {
    describe('when a blank string is provided', () => {
      it('returns null', () => {
        const qualification = qualificationFactory.build({
          otherCountriesRecognitionUrl: '',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.otherCountriesRecognitionUrl).toEqual(null);
      });
    });
    describe('when a URL is provided', () => {
      it('returns a link', () => {
        const qualification = qualificationFactory.build({
          otherCountriesRecognitionUrl: 'http://example.com',
        });

        const presenter = new QualificationPresenter(
          qualification,
          createMockI18nService(),
        );

        expect(presenter.otherCountriesRecognitionUrl).toEqual(
          '<a class="govuk-link" href="http://example.com">http://example.com</a>',
        );
      });
    });
  });

  describe('summaryList', () => {
    it('returns a summary list of all Qualification fields', async () => {
      const qualification = qualificationFactory.build({
        otherCountriesRecognitionUrl: 'http://example.com',
      });

      const presenter = new QualificationPresenter(
        qualification,
        createMockI18nService(),
      );

      expect(presenter.summaryList()).resolves.toEqual({
        classes: 'govuk-summary-list--no-border',
        rows: [
          {
            key: {
              text: translationOf('professions.show.qualification.level'),
            },
            value: {
              html: formatMultilineString(presenter.level),
            },
          },
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
                'professions.show.qualification.mostCommonRouteToObtain',
              ),
            },
            value: {
              html: presenter.mostCommonRouteToObtain,
            },
          },
          {
            key: {
              text: translationOf('professions.show.qualification.duration'),
            },
            value: {
              text: presenter.duration,
            },
          },
          {
            key: {
              text: translationOf(
                'professions.show.qualification.mandatoryExperience',
              ),
            },
            value: {
              text: translationOf(presenter.mandatoryProfessionalExperience),
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

  afterEach(() => {
    jest.resetAllMocks();
  });
});

import qualificationFactory from '../../testutils/factories/qualification';
import QualificationPresenter from './qualification.presenter';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { multilineOf } from '../../testutils/multiline-of';

jest.mock('../../helpers/format-multiline-string.helper');

describe(QualificationPresenter, () => {
  describe('routesToObtain', () => {
    it('returns the a multiline string of the text value', () => {
      (formatMultilineString as jest.Mock).mockImplementation(multilineOf);

      const qualification = qualificationFactory.build({
        routesToObtain: 'other value',
      });

      const presenter = new QualificationPresenter(qualification);

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

      const presenter = new QualificationPresenter(qualification);

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

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.mandatoryProfessionalExperience).toEqual('app.yes');
      });
    });

    describe('when false', () => {
      it('returns the localisation id for "No"', () => {
        const qualification = qualificationFactory.build({
          mandatoryProfessionalExperience: false,
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.mandatoryProfessionalExperience).toEqual('app.no');
      });
    });
  });

  describe('ukRecognitionUrl', () => {
    describe('when a blank string is provided', () => {
      it('returns null', () => {
        const qualification = qualificationFactory.build({
          ukRecognitionUrl: '',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.ukRecognitionUrl).toEqual(null);
      });
    });
    describe('when a URL is provided', () => {
      it('returns a link', () => {
        const qualification = qualificationFactory.build({
          ukRecognitionUrl: 'http://example.com',
        });

        const presenter = new QualificationPresenter(qualification);

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

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.otherCountriesRecognitionUrl).toEqual(null);
      });
    });
    describe('when a URL is provided', () => {
      it('returns a link', () => {
        const qualification = qualificationFactory.build({
          otherCountriesRecognitionUrl: 'http://example.com',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.otherCountriesRecognitionUrl).toEqual(
          '<a class="govuk-link" href="http://example.com">http://example.com</a>',
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

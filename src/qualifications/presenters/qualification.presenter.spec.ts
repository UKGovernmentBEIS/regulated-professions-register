import { MethodToObtain } from '../qualification.entity';
import qualificationFactory from '../../testutils/factories/qualification';
import QualificationPresenter from './qualification.presenter';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { multilineOf } from '../../testutils/multiline-of';

jest.mock('../../helpers/format-multiline-string.helper');

describe(QualificationPresenter, () => {
  describe('methodToObtainQualification', () => {
    describe('when the method to ObtainQualification is "others"', () => {
      it('returns the other text value', () => {
        (formatMultilineString as jest.Mock).mockImplementation(multilineOf);

        const qualification = qualificationFactory.build({
          methodToObtainDeprecated: MethodToObtain.Others,
          routesToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.methodToObtainQualification).toEqual(
          multilineOf('other value'),
        );

        expect(formatMultilineString).toBeCalledWith('other value');
      });
    });

    describe('when the method to ObtainQualification is not "others"', () => {
      it('returns the localisation id for the selected method', () => {
        const qualification = qualificationFactory.build({
          methodToObtainDeprecated: MethodToObtain.DegreeLevel,
          routesToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.methodToObtainQualification).toEqual(
          'professions.methodsToObtainQualification.degreeLevel',
        );
      });
    });
  });

  describe('mostCommonPathToObtainQualification', () => {
    describe('when the method to ObtainQualification is "others"', () => {
      it('returns the other text value', () => {
        (formatMultilineString as jest.Mock).mockImplementation(multilineOf);

        const qualification = qualificationFactory.build({
          commonPathToObtainDeprecated: MethodToObtain.Others,
          mostCommonRouteToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.mostCommonPathToObtainQualification).toEqual(
          multilineOf('other value'),
        );

        expect(formatMultilineString).toBeCalledWith('other value');
      });
    });

    describe('when the method to ObtainQualification is not "others"', () => {
      it('returns the localisation id for the selected method', () => {
        const qualification = qualificationFactory.build({
          commonPathToObtainDeprecated: MethodToObtain.DegreeLevel,
          mostCommonRouteToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.mostCommonPathToObtainQualification).toEqual(
          'professions.methodsToObtainQualification.degreeLevel',
        );
      });
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

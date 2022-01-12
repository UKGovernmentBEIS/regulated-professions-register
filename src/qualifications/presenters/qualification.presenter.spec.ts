import { MethodToObtain } from '../qualification.entity';
import qualificationFactory from '../../testutils/factories/qualification';
import QualificationPresenter from './qualification.presenter';

describe(QualificationPresenter, () => {
  describe('methodToObtainQualification', () => {
    describe('when the method to ObtainQualification is "others"', () => {
      it('returns the other text value', () => {
        const qualification = qualificationFactory.build({
          methodToObtain: MethodToObtain.Others,
          otherMethodToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.methodToObtainQualification).toEqual('other value');
      });
    });

    describe('when the method to ObtainQualification is not "others"', () => {
      it('returns the localisation id for the selected method', () => {
        const qualification = qualificationFactory.build({
          methodToObtain: MethodToObtain.DegreeLevel,
          otherMethodToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.methodToObtainQualification).toEqual(
          'professions.form.radioButtons.methodsToObtainQualification.degreeLevel',
        );
      });
    });
  });

  describe('mostCommonPathToObtainQualification', () => {
    describe('when the method to ObtainQualification is "others"', () => {
      it('returns the other text value', () => {
        const qualification = qualificationFactory.build({
          commonPathToObtain: MethodToObtain.Others,
          otherCommonPathToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.mostCommonPathToObtainQualification).toEqual(
          'other value',
        );
      });
    });

    describe('when the method to ObtainQualification is not "others"', () => {
      it('returns the localisation id for the selected method', () => {
        const qualification = qualificationFactory.build({
          commonPathToObtain: MethodToObtain.DegreeLevel,
          otherCommonPathToObtain: 'other value',
        });

        const presenter = new QualificationPresenter(qualification);

        expect(presenter.mostCommonPathToObtainQualification).toEqual(
          'professions.form.radioButtons.methodsToObtainQualification.degreeLevel',
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
});

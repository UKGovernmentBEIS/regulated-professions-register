import { MethodToObtain, Qualification } from '../qualification.entity';

export default class QualificationPresenter {
  constructor(private readonly qualification: Qualification) {}

  readonly level = this.qualification.level;

  readonly methodToObtainQualification: string =
    this.qualification.methodToObtain === MethodToObtain.Others
      ? this.qualification.otherMethodToObtain
      : `professions.form.radioButtons.methodsToObtainQualification.${this.qualification.methodToObtain}`;

  readonly mostCommonPathToObtainQualification: string =
    this.qualification.commonPathToObtain === MethodToObtain.Others
      ? this.qualification.otherCommonPathToObtain
      : `professions.form.radioButtons.methodsToObtainQualification.${this.qualification.commonPathToObtain}`;

  readonly duration = this.qualification.educationDuration;

  readonly mandatoryProfessionalExperience = this.qualification
    .mandatoryProfessionalExperience
    ? 'app.yes'
    : 'app.no';
}

import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { MethodToObtain, Qualification } from '../qualification.entity';

export default class QualificationPresenter {
  constructor(private readonly qualification: Qualification) {}

  readonly level = this.qualification.level;

  readonly methodToObtainQualification: string =
    this.qualification.methodToObtain === MethodToObtain.Others
      ? formatMultilineString(this.qualification.otherMethodToObtain)
      : `professions.methodsToObtainQualification.${this.qualification.methodToObtain}`;

  readonly mostCommonPathToObtainQualification: string =
    this.qualification.commonPathToObtain === MethodToObtain.Others
      ? formatMultilineString(this.qualification.otherCommonPathToObtain)
      : `professions.methodsToObtainQualification.${this.qualification.commonPathToObtain}`;

  readonly duration = this.qualification.educationDuration;

  readonly mandatoryProfessionalExperience = this.qualification
    .mandatoryProfessionalExperience
    ? 'app.yes'
    : 'app.no';
}

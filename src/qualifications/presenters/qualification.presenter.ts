import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { MethodToObtain, Qualification } from '../qualification.entity';
import { escape } from '../../helpers/escape.helper';
export default class QualificationPresenter {
  constructor(private readonly qualification: Qualification) {}

  readonly level = this.qualification.level;

  readonly methodToObtainQualification: string =
    this.qualification.methodToObtainDeprecated === MethodToObtain.Others
      ? formatMultilineString(this.qualification.otherMethodToObtain)
      : `professions.methodsToObtainQualification.${this.qualification.methodToObtainDeprecated}`;

  readonly mostCommonPathToObtainQualification: string =
    this.qualification.commonPathToObtainDeprecated === MethodToObtain.Others
      ? formatMultilineString(this.qualification.otherCommonPathToObtain)
      : `professions.methodsToObtainQualification.${this.qualification.commonPathToObtainDeprecated}`;

  readonly duration = this.qualification.educationDuration;

  readonly mandatoryProfessionalExperience = this.qualification
    .mandatoryProfessionalExperience
    ? 'app.yes'
    : 'app.no';

  readonly ukRecognition = this.qualification.ukRecognition;

  readonly ukRecognitionUrl = this.qualification.ukRecognitionUrl
    ? `<a class="govuk-link" href="${escape(
        this.qualification.ukRecognitionUrl,
      )}">${escape(this.qualification.ukRecognitionUrl)}</a>`
    : null;

  readonly otherCountriesRecognition =
    this.qualification.otherCountriesRecognition;

  readonly otherCountriesRecognitionUrl = this.qualification
    .otherCountriesRecognitionUrl
    ? `<a class="govuk-link" href="${escape(
        this.qualification.otherCountriesRecognitionUrl,
      )}">${escape(this.qualification.otherCountriesRecognitionUrl)}</a>`
    : null;
}

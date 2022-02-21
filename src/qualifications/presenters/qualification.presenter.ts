import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { Qualification } from '../qualification.entity';
import { escape } from '../../helpers/escape.helper';
export default class QualificationPresenter {
  constructor(private readonly qualification: Qualification) {}

  readonly level = this.qualification.level;

  readonly routesToObtain = formatMultilineString(
    this.qualification.routesToObtain,
  );

  readonly mostCommonRouteToObtain = formatMultilineString(
    this.qualification.mostCommonRouteToObtain,
  );

  readonly duration = this.qualification.educationDuration;

  readonly mandatoryProfessionalExperience = this.qualification
    .mandatoryProfessionalExperience
    ? 'app.yes'
    : 'app.no';

  readonly moreInformationUrl = this.qualification.url
    ? `<a class="govuk-link" href="${escape(this.qualification.url)}">${escape(
        this.qualification.url,
      )}</a>`
    : null;

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

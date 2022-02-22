import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { Qualification } from '../qualification.entity';
import { escape } from '../../helpers/escape.helper';
import { I18nService } from 'nestjs-i18n';
import { SummaryList } from '../../common/interfaces/summary-list';
export default class QualificationPresenter {
  constructor(
    private readonly qualification: Qualification,
    private readonly i18nService: I18nService,
  ) {}

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

  async summaryList(): Promise<SummaryList> {
    return {
      classes: 'govuk-summary-list--no-border',
      rows: [
        {
          key: {
            text: await this.i18nService.translate(
              'professions.show.qualification.level',
            ),
          },
          value: {
            html: formatMultilineString(this.level),
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'professions.show.qualification.routesToObtain',
            ),
          },
          value: {
            html: this.routesToObtain,
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'professions.show.qualification.mostCommonRouteToObtain',
            ),
          },
          value: {
            html: this.mostCommonRouteToObtain,
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'professions.show.qualification.duration',
            ),
          },
          value: {
            text: this.duration,
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'professions.show.qualification.mandatoryExperience',
            ),
          },
          value: {
            text: await this.i18nService.translate(
              this.mandatoryProfessionalExperience,
            ),
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'professions.show.qualification.moreInformationUrl',
            ),
          },
          value: {
            html: this.moreInformationUrl,
          },
        },
      ],
    };
  }
}

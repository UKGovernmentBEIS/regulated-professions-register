import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { Qualification } from '../qualification.entity';
import { I18nService } from 'nestjs-i18n';
import { SummaryList } from '../../common/interfaces/summary-list';
import { formatLink } from '../../helpers/format-link.helper';
export default class QualificationPresenter {
  constructor(
    private readonly qualification: Qualification,
    private readonly i18nService: I18nService,
  ) {}

  readonly routesToObtain = formatMultilineString(
    this.qualification && this.qualification.routesToObtain,
  );

  readonly moreInformationUrl = formatLink(
    this.qualification && this.qualification.url,
  );

  readonly ukRecognition =
    this.qualification && this.qualification.ukRecognition;

  readonly ukRecognitionUrl = formatLink(
    this.qualification && this.qualification.ukRecognitionUrl,
  );

  readonly otherCountriesRecognition =
    this.qualification && this.qualification.otherCountriesRecognition;

  readonly otherCountriesRecognitionUrl = formatLink(
    this.qualification && this.qualification.otherCountriesRecognitionUrl,
  );

  async summaryList(showEmptyFields: boolean): Promise<SummaryList> {
    return {
      classes: 'govuk-summary-list--no-border',
      rows: [
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
        showEmptyFields || this.moreInformationUrl
          ? {
              key: {
                text: await this.i18nService.translate(
                  'professions.show.qualification.moreInformationUrl',
                ),
              },
              value: {
                html: this.moreInformationUrl,
              },
            }
          : undefined,
      ],
    };
  }
}

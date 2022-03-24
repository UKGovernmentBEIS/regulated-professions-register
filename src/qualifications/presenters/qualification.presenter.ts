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

  readonly otherCountriesRecognitionSummary =
    this.qualification && this.qualification.otherCountriesRecognitionSummary;

  readonly otherCountriesRecognitionUrl = formatLink(
    this.qualification && this.qualification.otherCountriesRecognitionUrl,
  );

  async summaryList(
    showEmptyFields: boolean,
    showUKRecognitionFields: boolean,
  ): Promise<SummaryList> {
    const summaryList: SummaryList = {
      classes: 'govuk-summary-list--no-border',
      rows: [],
    };

    if (showEmptyFields || this.routesToObtain) {
      await this.addHtmlRow(
        summaryList,
        'professions.show.qualification.routesToObtain',
        this.routesToObtain,
      );
    }

    if (showEmptyFields || this.moreInformationUrl) {
      await this.addHtmlRow(
        summaryList,
        'professions.show.qualification.moreInformationUrl',
        this.moreInformationUrl,
      );
    }

    if (showUKRecognitionFields) {
      if (showEmptyFields || this.ukRecognition) {
        await this.addTextRow(
          summaryList,
          'professions.show.qualification.ukRecognition',
          this.ukRecognition,
        );
      }

      if (showEmptyFields || this.ukRecognitionUrl) {
        await this.addHtmlRow(
          summaryList,
          'professions.show.qualification.ukRecognitionUrl',
          this.ukRecognitionUrl,
        );
      }
    }

    // Only show this on the admin page until we've decided on the best way to present this to public users
    if (showEmptyFields) {
      await this.addTextRow(
        summaryList,
        'professions.show.qualification.otherCountriesRecognition.summary',
        this.otherCountriesRecognitionSummary,
      );
    }

    // Only show this on the admin page until we've decided on the best way to present this to public users
    if (showEmptyFields) {
      await this.addHtmlRow(
        summaryList,
        'professions.show.qualification.otherCountriesRecognition.url',
        this.otherCountriesRecognitionUrl,
      );
    }

    return summaryList;
  }

  private async addTextRow(
    summaryList: SummaryList,
    key: string,
    value: string,
  ): Promise<void> {
    summaryList.rows.push({
      key: { text: await this.i18nService.translate(key) },
      value: { text: value },
    });
  }

  private async addHtmlRow(
    summaryList: SummaryList,
    key: string,
    value: string,
  ): Promise<void> {
    summaryList.rows.push({
      key: { text: await this.i18nService.translate(key) },
      value: { html: value },
    });
  }
}

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

  readonly ukRecognition = formatMultilineString(
    this.qualification && this.qualification.ukRecognition,
  );

  readonly ukRecognitionUrl = formatLink(
    this.qualification && this.qualification.ukRecognitionUrl,
  );

  readonly adminSelectedOtherCountriesRecognitionRoutes =
    this.qualification && this.qualification.otherCountriesRecognitionRoutes;

  readonly publicOtherCountriesRecognitionRoutes =
    this.qualification && this.qualification.otherCountriesRecognitionRoutes;

  readonly otherCountriesRecognitionSummary = formatMultilineString(
    this.qualification && this.qualification.otherCountriesRecognitionSummary,
  );

  readonly otherCountriesRecognitionUrl = formatLink(
    this.qualification && this.qualification.otherCountriesRecognitionUrl,
  );

  async summaryList(
    showEmptyFields: boolean,
    showUKRecognitionFields: boolean,
  ): Promise<{
    overviewSummaryList: SummaryList;
    ukSummaryList: SummaryList;
    otherCountriesSummaryList: SummaryList;
  }> {
    const overviewSummaryList: SummaryList = {
      classes: 'govuk-summary-list--no-border',
      rows: [],
    };

    const ukSummaryList: SummaryList = {
      classes: 'govuk-summary-list--no-border',
      rows: [],
    };

    const otherCountriesSummaryList: SummaryList = {
      classes: 'govuk-summary-list--no-border',
      rows: [],
    };

    if (showEmptyFields || this.routesToObtain) {
      await this.addHtmlRow(
        overviewSummaryList,
        'professions.show.qualification.routesToObtain',
        this.routesToObtain,
      );
    }

    if (showEmptyFields || this.moreInformationUrl) {
      await this.addHtmlRow(
        overviewSummaryList,
        'professions.show.qualification.moreInformationUrl',
        this.moreInformationUrl,
      );
    }

    if (showUKRecognitionFields) {
      if (showEmptyFields || this.ukRecognition) {
        await this.addHtmlRow(
          ukSummaryList,
          'professions.show.qualification.ukRecognition',
          this.ukRecognition,
        );
      }

      if (showEmptyFields || this.ukRecognitionUrl) {
        await this.addHtmlRow(
          ukSummaryList,
          'professions.show.qualification.ukRecognitionUrl',
          this.ukRecognitionUrl,
        );
      }
    }

    if (showEmptyFields || this.publicOtherCountriesRecognitionRoutes) {
      await this.addTextRow(
        otherCountriesSummaryList,
        'professions.show.qualification.otherCountriesRecognition.routes.label',
        this.publicOtherCountriesRecognitionRoutes &&
          (await this.i18nService.translate(
            `professions.show.qualification.otherCountriesRecognition.routes.${this.publicOtherCountriesRecognitionRoutes}`,
          )),
      );
    }

    if (showEmptyFields || this.otherCountriesRecognitionSummary) {
      await this.addHtmlRow(
        otherCountriesSummaryList,
        'professions.show.qualification.otherCountriesRecognition.summary',
        this.otherCountriesRecognitionSummary,
      );
    }

    if (showEmptyFields || this.otherCountriesRecognitionUrl) {
      await this.addHtmlRow(
        otherCountriesSummaryList,
        'professions.show.qualification.otherCountriesRecognition.url',
        this.otherCountriesRecognitionUrl,
      );
    }

    return {
      overviewSummaryList:
        showEmptyFields || overviewSummaryList.rows.length
          ? overviewSummaryList
          : null,
      ukSummaryList:
        showUKRecognitionFields &&
        (showEmptyFields || ukSummaryList.rows.length)
          ? ukSummaryList
          : null,
      otherCountriesSummaryList:
        showEmptyFields || otherCountriesSummaryList.rows.length
          ? otherCountriesSummaryList
          : null,
    };
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

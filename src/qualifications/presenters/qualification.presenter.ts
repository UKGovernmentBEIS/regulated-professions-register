import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { Qualification } from '../qualification.entity';
import { I18nService } from 'nestjs-i18n';
import { SummaryList } from '../../common/interfaces/summary-list';
import { formatLink } from '../../helpers/format-link.helper';
import { Organisation } from '../../organisations/organisation.entity';

export default class QualificationPresenter {
  constructor(
    private readonly qualification: Qualification,
    private readonly i18nService: I18nService,
    private readonly awardingBodies?: Organisation[],
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

  summaryList(
    showEmptyFields: boolean,
    showUKRecognitionFields: boolean,
  ): {
    overviewSummaryList: SummaryList;
    ukSummaryList: SummaryList;
    otherCountriesSummaryList: SummaryList;
  } {
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
      this.addHtmlRow(
        overviewSummaryList,
        'professions.show.qualification.routesToObtain',
        this.routesToObtain,
      );
    }

    if (showEmptyFields || this.moreInformationUrl) {
      this.addHtmlRow(
        overviewSummaryList,
        'professions.show.qualification.moreInformationUrl',
        this.moreInformationUrl,
      );
    }

    if (this.awardingBodies?.length) {
      this.addHtmlRow(
        overviewSummaryList,
        'professions.show.qualification.awardingBodies',
        this.listAwardingBodies(),
      );
    }

    if (showUKRecognitionFields) {
      if (showEmptyFields || this.ukRecognition) {
        this.addHtmlRow(
          ukSummaryList,
          'professions.show.qualification.ukRecognition',
          this.ukRecognition,
        );
      }

      if (showEmptyFields || this.ukRecognitionUrl) {
        this.addHtmlRow(
          ukSummaryList,
          'professions.show.qualification.ukRecognitionUrl',
          this.ukRecognitionUrl,
        );
      }
    }

    if (showEmptyFields || this.publicOtherCountriesRecognitionRoutes) {
      this.addTextRow(
        otherCountriesSummaryList,
        'professions.show.qualification.otherCountriesRecognition.routes.label',
        this.publicOtherCountriesRecognitionRoutes &&
          (this.i18nService.translate<string>(
            `professions.show.qualification.otherCountriesRecognition.routes.${this.publicOtherCountriesRecognitionRoutes}`,
          ) as string),
      );
    }

    if (showEmptyFields || this.otherCountriesRecognitionSummary) {
      this.addHtmlRow(
        otherCountriesSummaryList,
        'professions.show.qualification.otherCountriesRecognition.summary',
        this.otherCountriesRecognitionSummary,
      );
    }

    if (showEmptyFields || this.otherCountriesRecognitionUrl) {
      this.addHtmlRow(
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

  private addTextRow(
    summaryList: SummaryList,
    key: string,
    value: string,
  ): void {
    summaryList.rows.push({
      key: { text: this.i18nService.translate<string>(key) as string },
      value: { text: value },
    });
  }

  private addHtmlRow(
    summaryList: SummaryList,
    key: string,
    value: string,
  ): void {
    summaryList.rows.push({
      key: { text: this.i18nService.translate<string>(key) as string },
      value: { html: value },
    });
  }

  private listAwardingBodies(): string {
    let list = '<ul class="govuk-list">';

    for (const organisation of this.awardingBodies) {
      list += `<li><a class="govuk-link" href="/regulatory-authorities/${organisation.slug}">${organisation.name}</a></li>`;
    }

    list += '</ul>';

    return list;
  }
}

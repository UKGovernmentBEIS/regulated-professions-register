import { I18nService } from 'nestjs-i18n';
import { SummaryList } from '../../common/interfaces/summary-list';
import { Profession } from '../profession.entity';

export class DecisionDatasetYearsPresenter {
  constructor(
    private readonly years: number[],
    private readonly profession: Profession,
    private readonly i18nService: I18nService,
  ) {}

  summaryList(): SummaryList {
    const key = {
      text: this.i18nService.translate<string>(
        'professions.show.decisions.year',
      ) as string,
    };

    return {
      classes: 'govuk-summary-list--no-border',
      rows: this.years.map((year) => ({
        key,
        value: {
          html: `<a href="${this.link(year)}" class="govuk-link">${year}</a>`,
        },
      })),
    };
  }

  link(year: number): string {
    return `/decisions/${this.profession.slug}/${year}`;
  }
}

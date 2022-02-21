import { I18nService } from 'nestjs-i18n';
import { Profession } from '../profession.entity';
import { SummaryList } from '../../common/interfaces/summary-list';
import { stringifyNations } from '../../nations/helpers/stringifyNations';
import { Nation } from '../../nations/nation';
import { formatDate } from '../../common/utils';

export class ProfessionPresenter {
  constructor(
    readonly profession: Profession,
    private readonly i18nService: I18nService,
  ) {}

  public async summaryList(): Promise<SummaryList> {
    return {
      classes: 'govuk-summary-list--no-border',
      rows: [
        {
          key: {
            text: await this.i18nService.translate(
              'professions.show.overview.nations',
            ),
          },
          value: {
            text: await this.occupationLocations(),
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'professions.show.overview.industry',
            ),
          },
          value: {
            text: await this.industries(),
          },
        },
      ],
    };
  }

  get changedBy(): string {
    return this.profession.changedByUser
      ? this.profession.changedByUser.name
      : '';
  }

  get lastModified(): string {
    return formatDate(this.profession.lastModified);
  }

  public async occupationLocations(): Promise<string> {
    return await stringifyNations(
      this.profession.occupationLocations.map((code) => Nation.find(code)),
      this.i18nService,
    );
  }

  public async industries(): Promise<string> {
    const industries = await Promise.all(
      this.profession.industries.map(
        async (industry) => await this.i18nService.translate(industry.name),
      ),
    );

    return industries.join(', ');
  }
}

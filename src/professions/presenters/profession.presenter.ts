import { I18nService } from 'nestjs-i18n';
import { Profession } from '../profession.entity';
import { SummaryList } from '../../common/interfaces/summary-list';
import { Nation } from '../../nations/nation';
import { formatDate } from '../../common/utils';
import { formatStatus } from '../../helpers/format-status.helper';
import { NationsListPresenter } from '../../nations/presenters/nations-list.presenter';

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

  get changedBy(): { name: string; email: string } {
    const user = this.profession.changedByUser;

    return user
      ? {
          name: user.name,
          email: user.email,
        }
      : null;
  }

  get lastModified(): string {
    return formatDate(this.profession.lastModified);
  }

  get status(): string {
    return formatStatus(this.profession.status, this.i18nService);
  }

  public async occupationLocations(): Promise<string> {
    return await new NationsListPresenter(
      (this.profession.occupationLocations || []).map((code) =>
        Nation.find(code),
      ),
      this.i18nService,
    ).textList();
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

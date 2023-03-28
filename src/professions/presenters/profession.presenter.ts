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

  public summaryList(): SummaryList {
    return {
      classes: 'govuk-summary-list--no-border',
      rows: [
        {
          key: {
            text: this.i18nService.translate<string>(
              'professions.show.overview.nations',
            ) as string,
          },
          value: {
            text: this.occupationLocations(),
          },
        },
        {
          key: {
            text: this.i18nService.translate<string>(
              'professions.show.overview.industry',
            ) as string,
          },
          value: {
            text: this.industries(),
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

  public occupationLocations(): string {
    return new NationsListPresenter(
      (this.profession.occupationLocations || []).map((code) =>
        Nation.find(code),
      ),
      this.i18nService,
    ).textList();
  }

  public industries(): string {
    const industries = this.profession.industries.map((industry) =>
      this.i18nService.translate<string>(industry.name),
    );

    return industries.join(', ');
  }
}

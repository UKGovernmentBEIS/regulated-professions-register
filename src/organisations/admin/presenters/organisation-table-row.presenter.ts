import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../../organisation.entity';
import { TableRow } from '../../../common/interfaces/table-row';
import { escape } from '../../../helpers/escape.helper';
import { formatDate } from '../../../common/utils';
import { Profession } from '../../../professions/profession.entity';
import { formatStatus } from '../../../helpers/format-status.helper';
import { getNationsFromProfessions } from '../../../helpers/nations.helper';

export class OrganisationTableRowPresenter {
  constructor(
    private readonly organisation: Organisation,
    private readonly i18nService: I18nService,
  ) {}

  public tableRow(): TableRow {
    return [
      {
        text: this.organisation.name,
      },
      {
        text: getNationsFromProfessions(this.professions(), this.i18nService),
      },
      {
        text: this.industries(),
      },
      {
        text: formatDate(this.organisation.lastModified),
      },
      {
        text: this.organisation.changedByUser?.name,
        attributes: {
          'data-cy': 'changed-by-user',
        },
      },
      {
        html: formatStatus(this.organisation.status, this.i18nService),
      },
      {
        html: `<a class="govuk-link" href="/admin/organisations/${
          this.organisation.id
        }/versions/${
          this.organisation.versionId
        }">${this.i18nService.translate<string>(
          'organisations.admin.viewDetails',
          { args: { name: escape(this.organisation.name) } },
        )}
        </a>`,
      },
    ];
  }

  private industries(): string {
    const industries = this.professions()
      .map((profession) => profession.industries)
      .flat();

    const industryNames = industries.map((industry) =>
      this.i18nService.translate<string>(industry.name),
    );

    return [...new Set(industryNames)].join(', ');
  }

  private professions(): Profession[] {
    return this.organisation.professionToOrganisations
      .filter((relation) => relation.profession)
      .map((relation) =>
        Profession.withLatestLiveOrDraftVersion(relation.profession),
      )
      .filter((profession) => !!profession);
  }
}

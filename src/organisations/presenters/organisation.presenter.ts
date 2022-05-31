import { I18nService } from 'nestjs-i18n';
import { Organisation } from './../organisation.entity';
import { TableRow } from '../../common/interfaces/table-row';
import { SummaryList } from '../../common/interfaces/summary-list';
import { escape } from '../../helpers/escape.helper';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { formatDate } from '../../common/utils';
import { formatLink } from '../../helpers/format-link.helper';
import { formatEmail } from '../../helpers/format-email.helper';
import { Profession } from '../../professions/profession.entity';
import { formatStatus } from '../../helpers/format-status.helper';
import { formatTelephone } from '../../helpers/format-telephone.helper';
import { getNationsFromProfessions } from '../../helpers/nations.helper';

interface OrganisationSummaryListOptions {
  classes?: string;
  removeBlank?: boolean;
  includeName?: boolean;
  includeActions?: boolean;
}

export class OrganisationPresenter {
  constructor(
    private readonly organisation: Organisation,
    private readonly i18nService: I18nService,
  ) {}

  public async tableRow(): Promise<TableRow> {
    return [
      {
        text: this.organisation.name,
      },
      {
        text: getNationsFromProfessions(this.professions(), this.i18nService),
      },
      {
        text: await this.industries(),
      },
      {
        text: this.lastModified,
      },
      {
        text: this.changedBy?.name,
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
        }">${await this.i18nService.translate(
          'organisations.admin.viewDetails',
          { args: { name: escape(this.organisation.name) } },
        )}
        </a>`,
      },
    ];
  }

  public async summaryList(
    options: OrganisationSummaryListOptions = {},
  ): Promise<SummaryList> {
    const classes = options.classes || 'govuk-summary-list--no-border';
    const removeBlank = options.removeBlank || false;
    const includeName = options.includeName || false;
    const includeActions = options.includeActions || false;

    let rows = [
      {
        key: {
          text: await this.i18nService.translate(
            'organisations.label.alternateName',
          ),
        },
        value: {
          text: this.organisation.alternateName,
        },
      },
      {
        key: {
          text: await this.i18nService.translate('organisations.label.url'),
        },
        value: {
          html: this.url(),
        },
      },
      {
        key: {
          text: await this.i18nService.translate('organisations.label.address'),
        },
        value: {
          html: this.address(),
        },
      },
      {
        key: {
          text: await this.i18nService.translate('organisations.label.email'),
        },
        value: {
          html: this.email(),
        },
      },
      {
        key: {
          text: await this.i18nService.translate(
            'organisations.label.telephone',
          ),
        },
        value: {
          text: this.telephone(),
        },
      },
    ];

    rows = removeBlank
      ? rows.filter((item) => {
          return !!item.value.text || !!item.value.html;
        })
      : rows;

    if (includeName) {
      rows.unshift({
        key: {
          text: await this.i18nService.translate('organisations.label.name'),
        },
        value: {
          text: this.organisation.name,
        },
      });
    }

    if (includeActions) {
      rows = await Promise.all(
        rows.map(async (row) => {
          return {
            ...row,
            actions: {
              items: [
                {
                  href: `/admin/organisations/${this.organisation.id}/versions/${this.organisation.versionId}/edit`,
                  text: await this.i18nService.translate('app.change'),
                  visuallyHiddenText: row.key.text,
                },
              ],
            },
          };
        }),
      );
    }

    return {
      classes: classes,
      rows: rows,
    };
  }

  get changedBy(): { name: string; email: string } {
    const user = this.organisation.changedByUser;

    return user
      ? {
          name: user.name,
          email: user.email,
        }
      : null;
  }

  get lastModified(): string {
    return formatDate(this.organisation.lastModified);
  }

  public address(): string {
    return formatMultilineString(this.organisation.address);
  }

  public email(): string {
    return formatEmail(this.organisation.email);
  }

  public telephone(): string {
    return formatTelephone(this.organisation.telephone);
  }

  public url(): string {
    return formatLink(this.organisation.url);
  }

  private async industries(): Promise<string> {
    const industries = this.professions()
      .map((profession) => profession.industries)
      .flat();

    const industryNames = await Promise.all(
      industries.map(
        (industry) =>
          this.i18nService.translate(industry.name) as Promise<string>,
      ),
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

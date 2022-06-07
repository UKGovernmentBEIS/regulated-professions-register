import { I18nService } from 'nestjs-i18n';
import { Organisation } from './../organisation.entity';
import { SummaryList } from '../../common/interfaces/summary-list';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { formatLink } from '../../helpers/format-link.helper';
import { formatEmail } from '../../helpers/format-email.helper';
import { formatTelephone } from '../../helpers/format-telephone.helper';

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

  public summaryList(
    options: OrganisationSummaryListOptions = {},
  ): SummaryList {
    const classes = options.classes || 'govuk-summary-list--no-border';
    const removeBlank = options.removeBlank || false;
    const includeName = options.includeName || false;
    const includeActions = options.includeActions || false;

    let rows = [
      {
        key: {
          text: this.i18nService.translate<string>(
            'organisations.label.alternateName',
          ),
        },
        value: {
          text: this.organisation.alternateName,
        },
      },
      {
        key: {
          text: this.i18nService.translate<string>('organisations.label.url'),
        },
        value: {
          html: this.url(),
        },
      },
      {
        key: {
          text: this.i18nService.translate<string>(
            'organisations.label.address',
          ),
        },
        value: {
          html: this.address(),
        },
      },
      {
        key: {
          text: this.i18nService.translate<string>('organisations.label.email'),
        },
        value: {
          html: this.email(),
        },
      },
      {
        key: {
          text: this.i18nService.translate<string>(
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
          text: this.i18nService.translate<string>('organisations.label.name'),
        },
        value: {
          text: this.organisation.name,
        },
      });
    }

    if (includeActions) {
      rows = rows.map((row) => {
        return {
          ...row,
          actions: {
            items: [
              {
                href: `/admin/organisations/${this.organisation.id}/versions/${this.organisation.versionId}/edit`,
                text: this.i18nService.translate<string>('app.change'),
                visuallyHiddenText: row.key.text,
              },
            ],
          },
        };
      });
    }

    return {
      classes: classes,
      rows: rows,
    };
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
}

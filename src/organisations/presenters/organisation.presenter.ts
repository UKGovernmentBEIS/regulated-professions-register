import { I18nService } from 'nestjs-i18n';
import { Organisation } from './../organisation.entity';
import { TableRow } from '../../common/interfaces/table-row';
import { SummaryList } from '../../common/interfaces/summary-list';

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
        text: this.organisation.alternateName,
      },
      {
        html: await this.industries(),
      },
      {
        html: `<a class="govuk-link" href="/admin/organisations/${this.organisation.slug}">
          View details
          <span class="govuk-visually-hidden">
            about ${this.organisation.name}
          </span>
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
          text: await this.i18nService.translate(
            'organisations.label.contactUrl',
          ),
        },
        value: {
          html: this.contactUrl(),
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
          text: this.organisation.telephone,
        },
      },
    ];

    rows = removeBlank
      ? rows.filter((item) => {
          return item.value.text !== '' && item.value.html !== '';
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
                  href: `/admin/organisations/${this.organisation.slug}/edit`,
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

  public address(): string {
    return this.organisation.address.split(',').join('<br />');
  }

  public email(): string {
    return `<a href="mailto:${this.organisation.email}" class="govuk-link">${this.organisation.email}</a>`;
  }

  public contactUrl(): string {
    return `<a href="${this.organisation.contactUrl}" class="govuk-link">${this.organisation.contactUrl}</a>`;
  }

  private async industries(): Promise<string> {
    const professions = this.organisation.professions;

    if (professions === undefined) {
      throw new Error(
        'You must eagerly load professions to show industries. Try calling a "WithProfessions" method on the `OrganisationsService` class',
      );
    }

    const industries = professions
      .map((profession) => {
        if (profession.industries === undefined) {
          throw new Error(
            'You must eagerly load industries to show industries. Try calling a "WithProfessions" method on the `OrganisationsService` class',
          );
        }

        return profession.industries;
      })
      .flat();

    const industryNames = await Promise.all(
      industries.map(
        (industry) =>
          this.i18nService.translate(industry.name) as Promise<string>,
      ),
    );

    return [...new Set(industryNames)].join('<br />');
  }
}

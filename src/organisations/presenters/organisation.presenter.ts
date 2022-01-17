import { I18nService } from 'nestjs-i18n';
import { Organisation } from './../organisation.entity';
import { TableRow } from '../../common/interfaces/table-row';
import { SummaryList } from '../../common/interfaces/summary-list';
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

  public async summaryList(): Promise<SummaryList> {
    return {
      classes: 'govuk-summary-list--no-border',
      rows: [
        {
          key: {
            text: await this.i18nService.translate(
              'organisations.admin.form.label.alternateName',
            ),
          },
          value: {
            text: this.organisation.alternateName,
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'organisations.admin.form.label.contactUrl',
            ),
          },
          value: {
            html: this.contactUrl(),
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'organisations.admin.form.label.address',
            ),
          },
          value: {
            html: this.address(),
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'organisations.admin.form.label.email',
            ),
          },
          value: {
            html: this.email(),
          },
        },
        {
          key: {
            text: await this.i18nService.translate(
              'organisations.admin.form.label.telephone',
            ),
          },
          value: {
            text: this.organisation.telephone,
          },
        },
      ].filter((item) => {
        return item.value.text !== '' && item.value.html !== '';
      }),
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
        "You must eagerly load professions to show industries. Try adding `{ relations: ['professions'] }` to your finder in the `OrganisationsService` class",
      );
    }

    const industries = professions
      .map((profession) => {
        if (profession.industries === undefined) {
          throw new Error(
            "You must eagerly load industries to show industries. Try adding `{ relations: ['professions.industries'] }` to your finder in the `OrganisationsService` class",
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

import { I18nService } from 'nestjs-i18n';
import { Organisation } from './../organisation.entity';
import { TableRow } from '../../common/interfaces/table-row';

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
        text: '',
      },
    ];
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

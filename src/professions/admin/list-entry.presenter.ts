import { I18nService } from 'nestjs-i18n';
import { TableCell } from '../../common/interfaces/table-cell';
import { TableRow } from '../../common/interfaces/table-row';
import { stringifyNations } from '../../nations/helpers/stringifyNations';
import { Nation } from '../../nations/nation';
import { ProfessionPresenter } from '../presenters/profession.presenter';
import { Profession } from '../profession.entity';
import { ProfessionsPresenterView } from './professions.presenter';

type Field =
  | 'profession'
  | 'nations'
  | 'lastModified'
  | 'changedBy'
  | 'organisation'
  | 'industry'
  | 'status'
  | 'actions';

const fields = {
  overview: [
    'profession',
    'nations',
    'lastModified',
    'changedBy',
    'organisation',
    'industry',
    'status',
    'actions',
  ],
  'single-organisation': [
    'profession',
    'nations',
    'lastModified',
    'changedBy',
    'status',
    'actions',
  ],
} as { [K in ProfessionsPresenterView]: Field[] };

export class ListEntryPresenter {
  static async headings(
    i18nService: I18nService,
    contents: ProfessionsPresenterView,
  ): Promise<TableRow> {
    return (
      await Promise.all(
        fields[contents].map(
          (field) =>
            i18nService.translate(
              `professions.admin.tableHeading.${field}`,
            ) as Promise<string>,
        ),
      )
    ).map((text) => ({ text }));
  }

  constructor(
    private readonly profession: Profession,
    private readonly i18nService: I18nService,
  ) {}

  async tableRow(contents: ProfessionsPresenterView): Promise<TableRow> {
    const presenter = new ProfessionPresenter(
      this.profession,
      this.i18nService,
    );

    const nations = await stringifyNations(
      this.profession.occupationLocations.map((code) => Nation.find(code)),
      this.i18nService,
    );

    const industries = (
      await Promise.all(
        this.profession.industries.map(
          (industry) =>
            this.i18nService.translate(industry.name) as Promise<string>,
        ),
      )
    ).join(', ');

    const viewDetails = `<a href="/admin/professions/${
      this.profession.id
    }/versions/${this.profession.versionId}">${await this.i18nService.translate(
      'professions.admin.viewDetails',
    )}</a>`;

    const entries: { [K in Field]: TableCell } = {
      profession: { text: this.profession.name },
      nations: { text: nations },
      lastModified: { text: presenter.lastModified },
      changedBy: { text: presenter.changedBy },
      organisation: {
        text: this.profession.organisation
          ? this.profession.organisation.name
          : '',
      },
      industry: { text: industries },
      status: {
        text: await this.i18nService.translate(
          `professions.admin.status.${this.profession.status}`,
        ),
      },
      actions: { html: viewDetails },
    };

    return fields[contents].map((field) => entries[field]);
  }
}

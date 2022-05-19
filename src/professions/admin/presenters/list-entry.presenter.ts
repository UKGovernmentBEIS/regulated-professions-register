import { I18nService } from 'nestjs-i18n';
import { TableCell } from '../../../common/interfaces/table-cell';
import { TableRow } from '../../../common/interfaces/table-row';
import { escape } from '../../../helpers/escape.helper';
import { Nation } from '../../../nations/nation';
import { getOrganisationsFromProfession } from '../../helpers/get-organisations-from-profession.helper';
import { ProfessionPresenter } from '../../presenters/profession.presenter';
import { Profession } from '../../profession.entity';
import { ProfessionsPresenterView } from './professions.presenter';
import { NationsListPresenter } from './../../../nations/presenters/nations-list.presenter';

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
    'organisation',
    'nations',
    'industry',
    'lastModified',
    'status',
    'actions',
  ],
  'single-organisation': [
    'profession',
    'nations',
    'industry',
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

    const nations = await new NationsListPresenter(
      (this.profession.occupationLocations || []).map((code) =>
        Nation.find(code),
      ),
      this.i18nService,
    ).textList();

    const industries = (
      await Promise.all(
        this.profession.industries.map(
          (industry) =>
            this.i18nService.translate(industry.name) as Promise<string>,
        ),
      )
    ).join(', ');

    const viewDetails = `<a class="govuk-link" href="/admin/professions/${
      this.profession.id
    }/versions/${this.profession.versionId}">${await this.i18nService.translate(
      'professions.admin.viewDetails',
      { args: { name: escape(this.profession.name) } },
    )}</a>`;

    const organisations = getOrganisationsFromProfession(this.profession);
    const organisationsHtml = `<ul class="govuk-list">
        ${organisations
          .map(
            (organisation, i) =>
              `<li>
              ${organisation.name}${i < organisations.length - 1 ? ',' : ''}
            </li>`,
          )
          .join('')}
          </ul>`;

    const entries: { [K in Field]: TableCell } = {
      profession: { text: this.profession.name },
      nations: { text: nations },
      lastModified: { text: presenter.lastModified },
      changedBy: { text: presenter.changedBy?.name },
      organisation: {
        html: organisationsHtml,
      },
      industry: { text: industries },
      status: { html: await presenter.status },
      actions: { html: viewDetails },
    };

    return fields[contents].map((field) => entries[field]);
  }
}

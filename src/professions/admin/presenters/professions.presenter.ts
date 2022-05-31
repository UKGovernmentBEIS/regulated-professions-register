import { I18nService } from 'nestjs-i18n';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { Industry } from '../../../industries/industry.entity';
import { Nation } from '../../../nations/nation';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { Profession } from '../../profession.entity';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { IndexTemplate } from './../interfaces/index-template.interface';
import { ListEntryPresenter } from './../presenters/list-entry.presenter';
import { Organisation } from '../../../organisations/organisation.entity';
import { OrganisationsCheckboxPresenter } from '../../../organisations/organisations-checkbox-presenter';
import { Table } from '../../../common/interfaces/table';
import { RegulationTypesCheckboxPresenter } from './regulation-types-checkbox.presenter';

export type ProfessionsPresenterView = 'overview' | 'single-organisation';

export class ProfessionsPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly userOrganisation: Organisation | null,
    private readonly allNations: Nation[],
    private readonly allOrganisations: Organisation[],
    private readonly allIndustries: Industry[],
    private readonly filteredProfessions: Profession[],
    private readonly i18nService: I18nService,
  ) {}

  async present(
    view: ProfessionsPresenterView,
  ): Promise<Omit<IndexTemplate, 'filterQuery' | 'sortMethod'>> {
    const organisation =
      view === 'overview'
        ? await this.i18nService.translate('app.beis')
        : this.userOrganisation.name;

    const nationsCheckboxItems = new NationsCheckboxPresenter(
      this.allNations,
      this.filterInput.nations || [],
      this.i18nService,
    ).checkboxItems();

    const organisationsCheckboxItems = new OrganisationsCheckboxPresenter(
      this.allOrganisations,
      this.filterInput.organisations || [],
    ).checkboxItems();

    const industriesCheckboxItems = new IndustriesCheckboxPresenter(
      this.allIndustries,
      this.filterInput.industries || [],
      this.i18nService,
    ).checkboxItems();

    const regulationTypesCheckboxItems = new RegulationTypesCheckboxPresenter(
      this.filterInput.regulationTypes || [],
      this.i18nService,
    ).checkboxItems();

    return {
      view,
      organisation,
      professionsTable: await this.table(view),
      nationsCheckboxItems,
      organisationsCheckboxItems,
      industriesCheckboxItems,
      regulationTypesCheckboxItems,
      filters: {
        keywords: this.filterInput.keywords || '',
        nations: (this.filterInput.nations || []).map((nation) => nation.name),
        organisations: (this.filterInput.organisations || []).map(
          (organisation) => organisation.name,
        ),
        industries: (this.filterInput.industries || []).map(
          (industry) => industry.name,
        ),
        regulationTypes: this.filterInput.regulationTypes || [],
      },
    };
  }

  private async table(view: ProfessionsPresenterView): Promise<Table> {
    const headings = await ListEntryPresenter.headings(this.i18nService, view);

    const rows = await Promise.all(
      this.filteredProfessions.map(async (profession) =>
        new ListEntryPresenter(profession, this.i18nService).tableRow(view),
      ),
    );

    const numberOfResults = rows.length;

    const caption =
      numberOfResults === 1
        ? await this.i18nService.translate('professions.search.foundSingular', {
            args: { count: numberOfResults },
          })
        : await this.i18nService.translate('professions.search.foundPlural', {
            args: { count: numberOfResults },
          });

    return {
      caption,
      captionClasses: 'govuk-table__caption--m',
      firstCellIsHeader: true,
      head: headings,
      rows: rows,
    };
  }
}

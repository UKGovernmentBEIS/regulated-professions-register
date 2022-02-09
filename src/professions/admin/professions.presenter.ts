import { I18nService } from 'nestjs-i18n';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { Industry } from '../../industries/industry.entity';
import { Nation } from '../../nations/nation';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { Profession } from '../profession.entity';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ListEntryPresenter } from './list-entry.presenter';
import { Organisation } from '../../organisations/organisation.entity';
import { OrganisationsCheckboxPresenter } from '../../organisations/organisations-checkbox-presenter';

export type ProfessionsPresenterView = 'overview' | 'single-organisation';

export class ProfessionsPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly userOrganisaiton: Organisation | null,
    private readonly allNations: Nation[],
    private readonly allOrganisations: Organisation[],
    private readonly allIndustries: Industry[],
    private readonly filteredProfessions: Profession[],
    private readonly i18nService: I18nService,
  ) {}

  async present(view: ProfessionsPresenterView): Promise<IndexTemplate> {
    const organisation =
      view === 'overview'
        ? await this.i18nService.translate('app.ukcpq')
        : this.userOrganisaiton.name;

    const headings = await ListEntryPresenter.headings(this.i18nService, view);

    const nationsCheckboxItems = await new NationsCheckboxPresenter(
      this.allNations,
      this.filterInput.nations || [],
      this.i18nService,
    ).checkboxItems();

    const organisationsCheckboxItems = await new OrganisationsCheckboxPresenter(
      this.allOrganisations,
      this.filterInput.organisations || [],
    ).checkboxItems();

    const industriesCheckboxItems = await new IndustriesCheckboxPresenter(
      this.allIndustries,
      this.filterInput.industries || [],
      this.i18nService,
    ).checkboxItems();

    const displayProfessions = await Promise.all(
      this.filteredProfessions.map(async (profession) =>
        new ListEntryPresenter(profession, this.i18nService).tableRow(view),
      ),
    );

    return {
      view,
      organisation,
      headings,
      professions: displayProfessions,
      nationsCheckboxItems,
      organisationsCheckboxItems,
      industriesCheckboxItems,
      changedByCheckboxItems: [],
      filters: {
        keywords: this.filterInput.keywords || '',
        nations: (this.filterInput.nations || []).map((nation) => nation.name),
        organisations: (this.filterInput.organisations || []).map(
          (organisation) => organisation.name,
        ),
        industries: (this.filterInput.industries || []).map(
          (industry) => industry.name,
        ),
        changedBy: [],
      },
    };
  }
}

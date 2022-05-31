import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { SearchPresenter } from './search.presenter';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { IndexTemplate } from './interfaces/index-template.interface';
import { OrganisationSearchResultPresenter } from './organisation-search-result.presenter';
import organisationFactory from '../../testutils/factories/organisation';
import industryFactory from '../../testutils/factories/industry';
import { hasSelectedFilters } from '../../search/helpers/has-selected-filters.helper';
import { RegulationType } from '../../professions/profession-version.entity';
import { RegulationTypesCheckboxPresenter } from '../../professions/admin/presenters/regulation-types-checkbox.presenter';

jest.mock('../../search/helpers/has-selected-filters.helper');

const organisation1 = organisationFactory.build({
  name: 'Example Organisation 1',
  professionToOrganisations: [],
});
const organisation2 = organisationFactory.build({
  name: 'Example Organisation 2',
  professionToOrganisations: [],
});
const organisation3 = organisationFactory.build({
  name: 'Example Organisation 3',
  professionToOrganisations: [],
});

const industry1 = industryFactory.build({
  name: 'industries.example1',
  id: 'example-industry-1',
});
const industry2 = industryFactory.build({
  name: 'industries.example2',
  id: 'example-industry-2',
});
const industry3 = industryFactory.build({
  name: 'industries.example3',
  id: 'example-industry-3',
});

const industries = [industry1, industry2, industry3];

describe('SearchPresenter', () => {
  let i18nService: DeepMocked<I18nService>;
  let nations: Nation[];

  beforeEach(() => {
    i18nService = createMockI18nService();

    nations = Nation.all();
  });

  describe('present', () => {
    it('should return a IndexTemplate', async () => {
      const filterInput: FilterInput = {
        keywords: 'Example Keywords',
        nations: [nations[0]],
        industries: [industry2],
        regulationTypes: [RegulationType.Accreditation],
      };

      const presenter = new SearchPresenter(
        filterInput,
        nations,
        industries,
        [organisation1, organisation2, organisation3],
        i18nService,
      );

      (hasSelectedFilters as jest.Mock).mockReturnValue(true);
      const result = await presenter.present();

      const nationsCheckboxItems = new NationsCheckboxPresenter(
        Nation.all(),
        [Nation.find('GB-ENG')],
        i18nService,
      ).checkboxItems();

      const industriesCheckboxItems = new IndustriesCheckboxPresenter(
        industries,
        [industry2],
        i18nService,
      ).checkboxItems();

      const regulationTypesCheckboxItems = new RegulationTypesCheckboxPresenter(
        [RegulationType.Accreditation],
        i18nService,
      ).checkboxItems();

      const expected: IndexTemplate = {
        filters: {
          keywords: 'Example Keywords',
          nations: ['nations.england'],
          industries: ['industries.example2'],
          regulationTypes: [RegulationType.Accreditation],
        },
        nationsCheckboxItems,
        industriesCheckboxItems,
        regulationTypesCheckboxItems,
        organisations: [
          await new OrganisationSearchResultPresenter(
            organisation1,
            i18nService,
          ).present(),
          await new OrganisationSearchResultPresenter(
            organisation2,
            i18nService,
          ).present(),
          await new OrganisationSearchResultPresenter(
            organisation3,
            i18nService,
          ).present(),
        ],
        hasSelectedFilters: true,
      };

      expect(hasSelectedFilters).toHaveBeenCalledWith(filterInput);

      expect(result).toEqual(expected);
    });
  });
});

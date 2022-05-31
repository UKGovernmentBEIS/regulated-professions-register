import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { SearchPresenter } from './search.presenter';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { ProfessionSearchResultPresenter } from './profession-search-result.presenter';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { IndexTemplate } from './interfaces/index-template.interface';
import { hasSelectedFilters } from '../../search/helpers/has-selected-filters.helper';
import { RegulationType } from '../profession-version.entity';
import { RegulationTypesCheckboxPresenter } from '../admin/presenters/regulation-types-checkbox.presenter';

jest.mock('../../search/helpers/has-selected-filters.helper');

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

const profession1 = professionFactory.build({
  name: 'Example Profession 1',
  occupationLocations: ['GB-ENG'],
  industries: [industry1],
});
const profession2 = professionFactory.build({
  name: 'Example Profession 1',
  occupationLocations: ['GB-SCT', 'GB-WLS'],
  industries: [industry2, industry3],
});
const profession3 = professionFactory.build({
  name: 'Example Profession 3',
  occupationLocations: ['GB-NIR'],
  industries: [industry2, industry3],
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
        regulationTypes: [
          RegulationType.Certification,
          RegulationType.Licensing,
        ],
      };

      const presenter = new SearchPresenter(
        filterInput,
        nations,
        industries,
        [profession1, profession2, profession3],
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
        [RegulationType.Certification, RegulationType.Licensing],
        i18nService,
      ).checkboxItems();

      const expected: IndexTemplate = {
        filters: {
          keywords: 'Example Keywords',
          industries: ['industries.example2'],
          nations: ['nations.england'],
          regulationTypes: [
            RegulationType.Certification,
            RegulationType.Licensing,
          ],
        },
        nationsCheckboxItems,
        industriesCheckboxItems,
        regulationTypesCheckboxItems,
        professions: [
          await new ProfessionSearchResultPresenter(
            profession1,
            i18nService,
          ).present(),
          await new ProfessionSearchResultPresenter(
            profession2,
            i18nService,
          ).present(),
          await new ProfessionSearchResultPresenter(
            profession3,
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

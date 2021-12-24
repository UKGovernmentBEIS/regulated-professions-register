import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../../common/create-mock-i18n-service';
import { createMockRequest } from '../../../common/create-mock-request';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { Industry } from '../../../industries/industry.entity';
import { Nation } from '../../../nations/nation';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { Organisation } from '../../../organisations/organisation.entity';
import { OrganisationsCheckboxPresenter } from '../../../organisations/organisations-checkbox-presenter';
import { FilterInput } from '../../interfaces/filter-input.interface';
import { Profession } from '../../profession.entity';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ListPresenter } from './list.presenter';
import { ListEntryPresenter } from './list-entry.presenter';

const transportIndustry = new Industry('industries.transport');
transportIndustry.id = 'transport';

const educationIndustry = new Industry('industries.education');
educationIndustry.id = 'education';

const industries = [transportIndustry, educationIndustry];

const organisation1 = new Organisation('Example Organisation 1');
organisation1.id = 'example-organisation-1';

const organisation2 = new Organisation('Example Organisation 2');
organisation2.id = 'example-organisation-2';

const organisations = [organisation1, organisation2];

const professionA = new Profession('Example Profession A');
professionA.occupationLocations = ['GB-ENG'];
professionA.industries = [transportIndustry];
professionA.organisation = organisation1;
professionA.updated_at = new Date(2011, 11, 1);

const professionB = new Profession('Example Profession B');
professionB.occupationLocations = ['GB-SCT', 'GB-NIR'];
professionB.industries = [educationIndustry];
professionB.organisation = organisation1;
professionB.updated_at = new Date(2023, 1, 4);

const professionC = new Profession('Example Profession C');
professionC.occupationLocations = ['GB-WLS'];
professionC.industries = [educationIndustry, transportIndustry];
professionC.organisation = organisation2;
professionC.updated_at = new Date(2019, 6, 4);

describe('ListPresenter', () => {
  let listPresenter: ListPresenter;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(() => {
    i18nService = createMockI18nService({
      'app.ukcpq': 'UK Centre for Professional Qualifications',
    });

    const filterInput: FilterInput = {
      keywords: 'Nuclear',
      nations: [Nation.find('GB-ENG')],
      organisations: [organisation1],
      industries: [transportIndustry],
    };

    const request = createMockRequest(
      'http://example.com/some/path',
      'example.com',
    );

    listPresenter = new ListPresenter(
      filterInput,
      organisation1,
      Nation.all(),
      organisations,
      industries,
      [professionC, professionA, professionB],
      request,
      i18nService,
    );
  });

  describe('present', () => {
    it('returns template params when called with `overview`', async () => {
      const result = await listPresenter.present('overview');

      const nations = Nation.all();

      const expected: IndexTemplate = {
        view: 'overview',
        organisation: 'UK Centre for Professional Qualifications',
        headings: await ListEntryPresenter.headings(i18nService, 'overview'),

        professions: await Promise.all(
          [professionA, professionB, professionC].map((profession) =>
            new ListEntryPresenter(profession, i18nService).tableRow(
              'overview',
            ),
          ),
        ),

        filters: {
          keywords: 'Nuclear',
          nations: ['nations.england'],
          organisations: ['Example Organisation 1'],
          industries: ['industries.transport'],
          changedBy: [],
        },

        nationsCheckboxArgs: await new NationsCheckboxPresenter(
          nations,
          [Nation.find('GB-ENG')],
          i18nService,
        ).checkboxArgs(),
        organisationsCheckboxArgs: await new OrganisationsCheckboxPresenter(
          organisations,
          [organisation1],
        ).checkboxArgs(),
        industriesCheckboxArgs: await new IndustriesCheckboxPresenter(
          industries,
          [transportIndustry],
          i18nService,
        ).checkboxArgs(),
        changedByCheckboxArgs: [],

        backLink: 'http://example.com/some/path',
      };

      expect(result).toEqual(expected);
    });

    it('returns template params when called with `single-organisation`', async () => {
      const result = await listPresenter.present('single-organisation');

      const nations = Nation.all();

      const expected: IndexTemplate = {
        view: 'single-organisation',
        organisation: 'Example Organisation 1',
        headings: await ListEntryPresenter.headings(
          i18nService,
          'single-organisation',
        ),

        professions: await Promise.all(
          [professionA, professionB, professionC].map((profession) =>
            new ListEntryPresenter(profession, i18nService).tableRow(
              'single-organisation',
            ),
          ),
        ),

        filters: {
          keywords: 'Nuclear',
          nations: ['nations.england'],
          organisations: ['Example Organisation 1'],
          industries: ['industries.transport'],
          changedBy: [],
        },

        nationsCheckboxArgs: await new NationsCheckboxPresenter(
          nations,
          [Nation.find('GB-ENG')],
          i18nService,
        ).checkboxArgs(),
        organisationsCheckboxArgs: await new OrganisationsCheckboxPresenter(
          organisations,
          [organisation1],
        ).checkboxArgs(),
        industriesCheckboxArgs: await new IndustriesCheckboxPresenter(
          industries,
          [transportIndustry],
          i18nService,
        ).checkboxArgs(),
        changedByCheckboxArgs: [],

        backLink: 'http://example.com/some/path',
      };

      expect(result).toEqual(expected);
    });
  });
});

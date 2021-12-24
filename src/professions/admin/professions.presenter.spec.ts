import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createMockRequest } from '../../testutils/create-mock-request';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { Nation } from '../../nations/nation';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { OrganisationsCheckboxPresenter } from '../../organisations/organisations-checkbox-presenter';
import { FilterInput } from '../interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ProfessionsPresenter as ProfessionsPresenter } from './professions.presenter';
import { ListEntryPresenter } from './list-entry.presenter';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';

const transportIndustry = industryFactory.build({
  id: 'transport',
  name: 'industries.transport',
});
const educationIndustry = industryFactory.build({
  id: 'education',
  name: 'industries.education',
});

const industries = [transportIndustry, educationIndustry];

const organisation1 = organisationFactory.build({
  id: 'example-organisation-1',
  name: 'Example Organisation 1',
});
const organisation2 = organisationFactory.build({
  id: 'example-organisation-2',
  name: 'Example Organisation 2',
});

const organisations = [organisation1, organisation2];

const professionA = professionFactory.build({
  name: 'Example Profession A',
  occupationLocations: ['GB-ENG'],
  industries: [transportIndustry],
  organisation: organisation1,
  updated_at: new Date(2011, 11, 1),
});
const professionB = professionFactory.build({
  name: 'Example Profession B',
  occupationLocations: ['GB-SCT', 'GB-NIR'],
  industries: [educationIndustry],
  organisation: organisation1,
  updated_at: new Date(2023, 1, 4),
});
const professionC = professionFactory.build({
  name: 'Example Profession C',
  occupationLocations: ['GB-WLS'],
  industries: [educationIndustry, transportIndustry],
  organisation: organisation2,
  updated_at: new Date(2019, 6, 4),
});

describe('ProfessionsPresenter', () => {
  let professionsPresenter: ProfessionsPresenter;
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

    professionsPresenter = new ProfessionsPresenter(
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
      const result = await professionsPresenter.present('overview');

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
      const result = await professionsPresenter.present('single-organisation');

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

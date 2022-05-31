import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { Nation } from '../../../nations/nation';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { OrganisationsCheckboxPresenter } from '../../../organisations/organisations-checkbox-presenter';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { IndexTemplate } from '../interfaces/index-template.interface';
import { ProfessionsPresenter as ProfessionsPresenter } from './professions.presenter';
import { ListEntryPresenter } from './list-entry.presenter';
import industryFactory from '../../../testutils/factories/industry';
import organisationFactory from '../../../testutils/factories/organisation';
import professionFactory from '../../../testutils/factories/profession';
import { translationOf } from '../../../testutils/translation-of';
import { RegulationType } from '../../profession-version.entity';
import { RegulationTypesCheckboxPresenter } from './regulation-types-checkbox.presenter';

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

const profession1 = professionFactory.build(
  {
    name: 'Example Profession 1',
    occupationLocations: ['GB-ENG'],

    industries: [transportIndustry],
    regulationType: RegulationType.Accreditation,
    updated_at: new Date(2011, 11, 1),
  },
  { transient: { organisations: [organisation1] } },
);
const profession2 = professionFactory.build(
  {
    name: 'Example Profession 2',
    occupationLocations: ['GB-SCT', 'GB-NIR'],
    industries: [educationIndustry],
    regulationType: RegulationType.Certification,
    updated_at: new Date(2023, 1, 4),
  },
  { transient: { organisations: [organisation1] } },
);
const profession3 = professionFactory.build(
  {
    name: 'Example Profession 3',
    occupationLocations: ['GB-WLS'],
    industries: [educationIndustry, transportIndustry],
    regulationType: RegulationType.Licensing,
    updated_at: new Date(2019, 6, 4),
  },
  { transient: { organisations: [organisation2] } },
);

describe('ProfessionsPresenter', () => {
  let professionsPresenter: ProfessionsPresenter;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(() => {
    i18nService = createMockI18nService();
    const filterInput: FilterInput = {
      keywords: 'Nuclear',
      nations: [Nation.find('GB-ENG')],
      organisations: [organisation1],
      industries: [transportIndustry],
      regulationTypes: [RegulationType.Certification],
    };

    professionsPresenter = new ProfessionsPresenter(
      filterInput,
      organisation1,
      Nation.all(),
      organisations,
      industries,
      [profession1, profession2, profession3],
      i18nService,
    );
  });

  describe('present', () => {
    it('returns template params when called with `overview`', async () => {
      const result = await professionsPresenter.present('overview');

      const nations = Nation.all();

      const expected: Omit<IndexTemplate, 'filterQuery' | 'sortMethod'> = {
        view: 'overview',
        organisation: translationOf('app.beis'),
        professionsTable: {
          caption: `${translationOf('professions.search.foundPlural')}`,
          captionClasses: 'govuk-table__caption--m',
          firstCellIsHeader: true,
          head: ListEntryPresenter.headings(i18nService, 'overview'),
          rows: [profession1, profession2, profession3].map((profession) =>
            new ListEntryPresenter(profession, i18nService).tableRow(
              'overview',
            ),
          ),
        },
        filters: {
          keywords: 'Nuclear',
          nations: ['nations.england'],
          organisations: ['Example Organisation 1'],
          industries: ['industries.transport'],
          regulationTypes: [RegulationType.Certification],
        },

        nationsCheckboxItems: new NationsCheckboxPresenter(
          nations,
          [Nation.find('GB-ENG')],
          i18nService,
        ).checkboxItems(),
        organisationsCheckboxItems: new OrganisationsCheckboxPresenter(
          organisations,
          [organisation1],
        ).checkboxItems(),
        industriesCheckboxItems: new IndustriesCheckboxPresenter(
          industries,
          [transportIndustry],
          i18nService,
        ).checkboxItems(),
        regulationTypesCheckboxItems: new RegulationTypesCheckboxPresenter(
          [RegulationType.Certification],
          i18nService,
        ).checkboxItems(),
      };

      expect(result).toEqual(expected);
    });

    it('returns template params when called with `single-organisation`', async () => {
      const result = await professionsPresenter.present('single-organisation');

      const nations = Nation.all();

      const expected: Omit<IndexTemplate, 'filterQuery' | 'sortMethod'> = {
        view: 'single-organisation',
        organisation: 'Example Organisation 1',
        professionsTable: {
          caption: `${translationOf('professions.search.foundPlural')}`,
          captionClasses: 'govuk-table__caption--m',
          firstCellIsHeader: true,
          head: ListEntryPresenter.headings(i18nService, 'single-organisation'),
          rows: [profession1, profession2, profession3].map((profession) =>
            new ListEntryPresenter(profession, i18nService).tableRow(
              'single-organisation',
            ),
          ),
        },
        filters: {
          keywords: 'Nuclear',
          nations: ['nations.england'],
          organisations: ['Example Organisation 1'],
          industries: ['industries.transport'],
          regulationTypes: [RegulationType.Certification],
        },
        nationsCheckboxItems: new NationsCheckboxPresenter(
          nations,
          [Nation.find('GB-ENG')],
          i18nService,
        ).checkboxItems(),
        organisationsCheckboxItems: new OrganisationsCheckboxPresenter(
          organisations,
          [organisation1],
        ).checkboxItems(),
        industriesCheckboxItems: new IndustriesCheckboxPresenter(
          industries,
          [transportIndustry],
          i18nService,
        ).checkboxItems(),
        regulationTypesCheckboxItems: new RegulationTypesCheckboxPresenter(
          [RegulationType.Certification],
          i18nService,
        ).checkboxItems(),
      };

      expect(result).toEqual(expected);
    });

    describe('captions', () => {
      describe('when only one profession is found', () => {
        it('returns the singular professions found text', async () => {
          const i18nService = createMockI18nService();
          const industries = industryFactory.buildList(3);
          const filterInput: FilterInput = {};

          const organisation = organisationFactory.build({
            id: 'example-organisation',
            name: 'Example Organisation',
          });

          const organisations = [organisation, organisationFactory.build()];

          const foundProfessions = professionFactory.buildList(1);

          const presenter = new ProfessionsPresenter(
            filterInput,
            organisation,
            Nation.all(),
            organisations,
            industries,
            foundProfessions,
            i18nService,
          );

          const result = await presenter.present('overview');

          expect(result.professionsTable.caption).toEqual(
            `${translationOf('professions.search.foundSingular')}`,
          );
        });
      });

      describe('when more than one profession is found', () => {
        it('returns the singular professions found text', async () => {
          const i18nService = createMockI18nService();
          const industries = industryFactory.buildList(3);
          const filterInput: FilterInput = {};

          const organisation = organisationFactory.build({
            id: 'example-organisation',
            name: 'Example Organisation',
          });

          const organisations = [organisation, organisationFactory.build()];

          const foundProfessions = professionFactory.buildList(3);

          const presenter = new ProfessionsPresenter(
            filterInput,
            organisation,
            Nation.all(),
            organisations,
            industries,
            foundProfessions,
            i18nService,
          );

          const result = await presenter.present('overview');

          expect(result.professionsTable.caption).toEqual(
            `${translationOf('professions.search.foundPlural')}`,
          );
        });
      });
    });
  });
});

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Nation } from '../../nations/nation';
import { SearchController } from './search.controller';
import { SearchPresenter } from './search.presenter';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { OrganisationsService } from '../organisations.service';
import { IndustriesService } from '../../industries/industries.service';

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

const organisation1 = organisationFactory.build({
  name: 'General Medical Council',
  professions: [
    professionFactory.build({
      occupationLocations: ['GB-SCT'],
      industries: [industry1],
    }),
  ],
});
const organisation2 = organisationFactory.build({
  name: 'Department for Education',
  professions: [
    professionFactory.build({
      occupationLocations: ['GB-WLS', 'GB-ENG'],
      industries: [industry2],
    }),
  ],
});

const industries = [industry1, industry2, industry3];

describe('SearchController', () => {
  let organisationsService: DeepMocked<OrganisationsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let i18nService: DeepMocked<I18nService>;

  let controller: SearchController;

  beforeEach(async () => {
    organisationsService = createMock<OrganisationsService>();
    organisationsService.allWithProfessions.mockResolvedValue([
      organisation1,
      organisation2,
    ]);

    industriesService = createMock<IndustriesService>();
    industriesService.all.mockResolvedValue(industries);

    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: IndustriesService,
          useValue: industriesService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
      controllers: [SearchController],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('should return populated template params', async () => {
      const result = await controller.index();

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [],
        },
        Nation.all(),
        industries,
        [organisation1, organisation2],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should request organisations populated with professions from `OrganisationsService`', async () => {
      await controller.create({
        keywords: '',
        industries: [],
        nations: [],
      });

      expect(organisationsService.allWithProfessions).toHaveBeenCalled();
      expect(organisationsService.all).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should return template params populated with provided search filters', async () => {
      const result = await controller.create({
        keywords: 'example search',
        industries: [industry1.id, industry2.id],
        nations: ['GB-NIR'],
      });

      const expected = await new SearchPresenter(
        {
          keywords: 'example search',
          industries: [industry1, industry2],
          nations: [Nation.find('GB-NIR')],
        },
        Nation.all(),
        industries,
        [],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return filtered organisations when searching by nation', async () => {
      const result = await controller.create({
        keywords: '',
        industries: [],
        nations: ['GB-SCT'],
      });

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [Nation.find('GB-SCT')],
        },
        Nation.all(),
        industries,
        [organisation1],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return filtered organisations when searching by industry', async () => {
      const result = await controller.create({
        keywords: '',
        industries: [industry2.id],
        nations: [],
      });

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [industry2],
          nations: [],
        },
        Nation.all(),
        industries,
        [organisation2],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return filtered organisations when searching by keyword', async () => {
      const result = await controller.create({
        keywords: 'Medical',
        industries: [],
        nations: [],
      });

      const expected = await new SearchPresenter(
        {
          keywords: 'Medical',
          industries: [],
          nations: [],
        },
        Nation.all(),
        industries,
        [organisation1],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return unfiltered organisations when no search parameters are specified', async () => {
      const result = await controller.create({
        keywords: '',
        industries: [],
        nations: [],
      });

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [],
        },
        Nation.all(),
        industries,
        [organisation1, organisation2],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });
  });
});

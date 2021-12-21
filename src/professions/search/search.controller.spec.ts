import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { createMockRequest } from '../../common/create-mock-request';
import { IndustriesService } from '../../industries/industries.service';
import { Industry } from '../../industries/industry.entity';
import { Profession } from '../profession.entity';

import { ProfessionsService } from '../professions.service';
import { SearchController } from './search.controller';
import { SearchPresenter } from './search.presenter';

const referrer = 'http://example.com/some/path';
const host = 'example.com';

const exampleIndustry1 = new Industry('industries.example1');
exampleIndustry1.id = 'example-industry-1';

const exampleIndustry2 = new Industry('industries.example2');
exampleIndustry2.id = 'example-industry-2';

const exampleIndustry3 = new Industry('industries.example3');
exampleIndustry3.id = 'example-industry-3';

const exampleIndustries = [
  exampleIndustry1,
  exampleIndustry2,
  exampleIndustry3,
];

const exampleProfession1 = new Profession(
  'Secondary School Teacher',
  '',
  null,
  '',
  ['GB-ENG'],
  '',
  [exampleIndustry1],
);

const exampleProfession2 = new Profession(
  'Trademark Attorny',
  '',
  null,
  '',
  ['GB-SCT', 'GB-WLS'],
  '',
  [exampleIndustry2, exampleIndustry3],
);

describe('SearchController', () => {
  let request: DeepMocked<Request>;

  let controller: SearchController;
  let professionsService: DeepMocked<ProfessionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    request = createMockRequest(referrer, host);

    professionsService = createMock<ProfessionsService>();
    industriesService = createMock<IndustriesService>();
    i18nService = createMock<I18nService>();

    professionsService.all.mockImplementation(async () => {
      return [exampleProfession1, exampleProfession2];
    });

    industriesService.all.mockImplementation(async () => {
      return exampleIndustries;
    });

    i18nService.translate.mockImplementation(async (text) => {
      switch (text) {
        case 'industries.example1':
          return 'Example industry 1';
        case 'industries.example2':
          return 'Example industry 2';
        case 'industries.example3':
          return 'Example industry 3';
        case 'nations.england':
          return 'England';
        case 'nations.scotland':
          return 'Scotland';
        case 'nations.wales':
          return 'Wales';
        case 'nations.northernIreland':
          return 'Northern Ireland';
        default:
          return '';
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionsService,
          useValue: professionsService,
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
      const result = await controller.index(request);

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [],
        },
        Nation.all(),
        exampleIndustries,
        [exampleProfession1, exampleProfession2],
      ).present(i18nService, request);

      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should return template params populated with provided search filters', async () => {
      const result = await controller.create(
        {
          keywords: 'example search',
          industries: [exampleIndustry1.id, exampleIndustry2.id],
          nations: 'GB-SCT',
        },
        request,
      );

      const allNations = Nation.all();
      const scotland = Nation.find('GB-SCT');

      const expected = await new SearchPresenter(
        {
          keywords: 'example search',
          industries: [exampleIndustry1, exampleIndustry2],
          nations: [scotland],
        },
        allNations,
        exampleIndustries,
        [],
      ).present(i18nService, request);

      expect(result).toEqual(expected);
    });

    it('should return filtered professions when searching by nation', async () => {
      const result = await controller.create(
        {
          keywords: '',
          industries: [],
          nations: 'GB-WLS',
        },
        request,
      );

      const allNations = Nation.all();
      const wales = Nation.find('GB-WLS');

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [wales],
        },
        allNations,
        exampleIndustries,
        [exampleProfession2],
      ).present(i18nService, request);

      expect(result).toEqual(expected);
    });

    it('should return filtered professions when searching by industry', async () => {
      const result = await controller.create(
        {
          keywords: '',
          industries: [exampleIndustry1.id],
          nations: [],
        },
        request,
      );

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [exampleIndustry1],
          nations: [],
        },
        Nation.all(),
        exampleIndustries,
        [exampleProfession1],
      ).present(i18nService, request);

      expect(result).toEqual(expected);
    });

    it('should return filtered professions when searching by keyword', async () => {
      const result = await controller.create(
        {
          keywords: 'Trademark',
          industries: [],
          nations: [],
        },
        request,
      );

      const expected = await new SearchPresenter(
        {
          keywords: 'Trademark',
          industries: [],
          nations: [],
        },
        Nation.all(),
        exampleIndustries,
        [exampleProfession2],
      ).present(i18nService, request);

      expect(result).toEqual(expected);
    });

    it('should return unfiltered professions when no search parameters are specified', async () => {
      const result = await controller.create(
        {
          keywords: '',
          industries: [],
          nations: [],
        },
        request,
      );

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [],
        },
        Nation.all(),
        exampleIndustries,
        [exampleProfession1, exampleProfession2],
      ).present(i18nService, request);

      expect(result).toEqual(expected);
    });
  });
});

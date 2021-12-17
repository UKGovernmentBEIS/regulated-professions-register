import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockRequest } from '../../common/create-mock-request';
import { IndustriesService } from '../../industries/industries.service';
import { Industry } from '../../industries/industry.entity';
import { Profession } from '../profession.entity';

import { ProfessionsService } from '../professions.service';
import { IndexTemplate } from './interfaces/index-template.interface';
import { SearchController } from './search.controller';

const referrer = 'http://example.com/some/path';
const host = 'example.com';

const exampleIndustry1 = new Industry('industries.example1');
exampleIndustry1.id = 'example-industry-1';

const exampleIndustry2 = new Industry('industries.example2');
exampleIndustry2.id = 'example-industry-2';

const exampleIndustry3 = new Industry('industries.example3');
exampleIndustry3.id = 'example-industry-3';

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
      return [exampleIndustry1, exampleIndustry2, exampleIndustry3];
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
        case 'nations.wales':
          return 'Wales';
        case 'nations.scotland':
          return 'Scotland';
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

      expect(result).toMatchObject({
        ...createNationsOptionsSelectArgs(),
        ...createIndustriesOptionsSelectArgs(),
        filters: {
          keywords: '',
          nations: [],
          industries: [],
        },
        professions: [
          {
            name: exampleProfession1.name,
          },
          {
            name: exampleProfession2.name,
          },
        ],
        backLink: referrer,
      });
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

      expect(result).toMatchObject({
        ...createNationsOptionsSelectArgs('GB-SCT'),
        ...createIndustriesOptionsSelectArgs(
          'example-industry-1',
          'example-industry-2',
        ),
        filters: {
          keywords: 'example search',
          nations: ['nations.scotland'],
          industries: ['industries.example1', 'industries.example2'],
        },
      });
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

      expect(result.professions).toMatchObject([
        { name: 'Trademark Attorny' },
      ]);
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

      expect(result.professions).toMatchObject([
        { name: 'Secondary School Teacher' },
      ]);
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

      expect(result.professions).toMatchObject([
        { name: 'Trademark Attorny' },
      ]);
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

      expect(result.professions).toMatchObject([
        {
          name: 'Secondary School Teacher',
        },
        {
          name: 'Trademark Attorny',
        },
      ]);
    });
  });
});

function createNationsOptionsSelectArgs(
  ...args: string[]
): Pick<IndexTemplate, 'nationsOptionSelectArgs'> {
  return {
    nationsOptionSelectArgs: [
      {
        text: 'nations.england',
        value: 'GB-ENG',
        checked: args.includes('GB-ENG'),
      },
      {
        text: 'nations.scotland',
        value: 'GB-SCT',
        checked: args.includes('GB-SCT'),
      },
      {
        text: 'nations.wales',
        value: 'GB-WLS',
        checked: args.includes('GB-WLS'),
      },
      {
        text: 'nations.northernIreland',
        value: 'GB-NIR',
        checked: args.includes('GB-NIR'),
      },
    ],
  };
}

function createIndustriesOptionsSelectArgs(
  ...args: string[]
): Pick<IndexTemplate, 'industriesOptionSelectArgs'> {
  return {
    industriesOptionSelectArgs: [
      {
        text: exampleIndustry1.name,
        value: exampleIndustry1.id,
        checked: args.includes(exampleIndustry1.id),
      },
      {
        text: exampleIndustry2.name,
        value: exampleIndustry2.id,
        checked: args.includes(exampleIndustry2.id),
      },
      {
        text: exampleIndustry3.name,
        value: exampleIndustry3.id,
        checked: args.includes(exampleIndustry3.id),
      },
    ],
  };
}

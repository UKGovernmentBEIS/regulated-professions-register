import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { createMockRequest } from '../../testutils/create-mock-request';
import { IndustriesService } from '../../industries/industries.service';
import { ProfessionsService } from '../professions.service';
import { SearchController } from './search.controller';
import { SearchPresenter } from './search.presenter';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';

const referrer = 'http://example.com/some/path';
const host = 'example.com';

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
  name: 'Secondary School Teacher',
  occupationLocations: ['GB-ENG'],
  industries: [industry1],
});
const profession2 = professionFactory.build({
  name: 'Trademark Attorny',
  occupationLocations: ['GB-SCT', 'GB-WLS'],
  industries: [industry2, industry3],
});

const industries = [industry1, industry2, industry3];

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

    professionsService.allConfirmed.mockResolvedValue([
      profession1,
      profession2,
    ]);
    industriesService.all.mockResolvedValue(industries);

    i18nService = createMockI18nService();

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
        industries,
        [profession1, profession2],
        i18nService,
        request,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should request only complete professions from `ProfessionsService`', async () => {
      await controller.create(
        {
          keywords: '',
          industries: [],
          nations: [],
        },
        request,
      );

      expect(professionsService.allConfirmed).toHaveBeenCalled();
      expect(professionsService.all).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should return template params populated with provided search filters', async () => {
      const result = await controller.create(
        {
          keywords: 'example search',
          industries: [industry1.id, industry2.id],
          nations: ['GB-SCT'],
        },
        request,
      );

      const expected = await new SearchPresenter(
        {
          keywords: 'example search',
          industries: [industry1, industry2],
          nations: [Nation.find('GB-SCT')],
        },
        Nation.all(),
        industries,
        [],
        i18nService,
        request,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return filtered professions when searching by nation', async () => {
      const result = await controller.create(
        {
          keywords: '',
          industries: [],
          nations: ['GB-WLS'],
        },
        request,
      );

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [Nation.find('GB-WLS')],
        },
        Nation.all(),
        industries,
        [profession2],
        i18nService,
        request,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return filtered professions when searching by industry', async () => {
      const result = await controller.create(
        {
          keywords: '',
          industries: [industry1.id],
          nations: [],
        },
        request,
      );

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [industry1],
          nations: [],
        },
        Nation.all(),
        industries,
        [profession1],
        i18nService,
        request,
      ).present();

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
        industries,
        [profession2],
        i18nService,
        request,
      ).present();

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
        industries,
        [profession1, profession2],
        i18nService,
        request,
      ).present();

      expect(result).toEqual(expected);
    });
  });
});

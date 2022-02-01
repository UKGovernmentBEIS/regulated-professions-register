import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { IndustriesService } from '../../industries/industries.service';
import { ProfessionsService } from '../professions.service';
import { SearchController } from './search.controller';
import { SearchPresenter } from './search.presenter';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';

describe('SearchController', () => {
  let controller: SearchController;
  let professionsService: DeepMocked<ProfessionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    industriesService = createMock<IndustriesService>();

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

  describe('index', () => {
    it('should return populated template params', async () => {
      const industry1 = industryFactory.build({ id: 'example-industry-1' });
      const industry2 = industryFactory.build({ id: 'example-industry-2' });
      const industry3 = industryFactory.build({ id: 'example-industry-3' });
      const industries = [industry1, industry2, industry3];
      industriesService.all.mockResolvedValue(industries);

      const schoolTeacher = professionFactory.build({
        name: 'Secondary School Teacher',
        industries: [industry1],
      });
      const trademarkAttorney = professionFactory.build({
        name: 'Trademark Attorney',
        industries: [industry2, industry3],
      });
      professionsService.allConfirmed.mockResolvedValue([
        schoolTeacher,
        trademarkAttorney,
      ]);

      const result = await controller.index();

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [],
        },
        Nation.all(),
        industries,
        [schoolTeacher, trademarkAttorney],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should request only complete professions from `ProfessionsService`', async () => {
      await controller.create({
        keywords: '',
        industries: [],
        nations: [],
      });

      expect(professionsService.allConfirmed).toHaveBeenCalled();
      expect(professionsService.all).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should return template params populated with provided search filters', async () => {
      const industry1 = industryFactory.build();
      const industry2 = industryFactory.build();
      const industry3 = industryFactory.build();
      const industries = [industry1, industry2, industry3];
      industriesService.all.mockResolvedValue(industries);

      const schoolTeacher = professionFactory.build({
        name: 'Secondary School Teacher',
        industries: [industry1],
      });
      const trademarkAttorney = professionFactory.build({
        name: 'Trademark Attorney',
        industries: [industry2, industry3],
      });
      professionsService.allConfirmed.mockResolvedValue([
        schoolTeacher,
        trademarkAttorney,
      ]);

      const result = await controller.create({
        keywords: 'example search',
        industries: [industry1.id, industry2.id],
        nations: ['GB-SCT'],
      });

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
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return filtered professions when searching by nation', async () => {
      const industry1 = industryFactory.build();
      const industry2 = industryFactory.build();
      const industry3 = industryFactory.build();
      const industries = [industry1, industry2, industry3];
      industriesService.all.mockResolvedValue(industries);

      const professionRegulatedInEngland = professionFactory.build({
        name: 'Secondary School Teacher',
        industries: [industry1],
        occupationLocations: ['GB-ENG'],
      });
      const professionRegulatedInWales = professionFactory.build({
        name: 'Trademark Attorney',
        industries: [industry2, industry3],
        occupationLocations: ['GB-WLS'],
      });
      professionsService.allConfirmed.mockResolvedValue([
        professionRegulatedInEngland,
        professionRegulatedInWales,
      ]);

      const result = await controller.create({
        keywords: '',
        industries: [],
        nations: ['GB-WLS'],
      });

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [],
          nations: [Nation.find('GB-WLS')],
        },
        Nation.all(),
        industries,
        [professionRegulatedInWales],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return filtered professions when searching by industry', async () => {
      const educationIndustry = industryFactory.build({
        name: 'industries.education',
      });
      const lawIndustry = industryFactory.build({ name: 'industries.law' });
      const industries = [educationIndustry, lawIndustry];
      industriesService.all.mockResolvedValue(industries);

      const schoolTeacher = professionFactory.build({
        name: 'Secondary School Teacher',
        industries: [educationIndustry],
      });
      const trademarkAttorney = professionFactory.build({
        name: 'Trademark Attorney',
        industries: [lawIndustry],
      });
      professionsService.allConfirmed.mockResolvedValue([
        schoolTeacher,
        trademarkAttorney,
      ]);

      const result = await controller.create({
        keywords: '',
        industries: [educationIndustry.id],
        nations: [],
      });

      const expected = await new SearchPresenter(
        {
          keywords: '',
          industries: [educationIndustry],
          nations: [],
        },
        Nation.all(),
        industries,
        [schoolTeacher],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return filtered professions when searching by keyword', async () => {
      const industry1 = industryFactory.build();
      const industry2 = industryFactory.build();
      const industry3 = industryFactory.build();
      const industries = [industry1, industry2, industry3];
      industriesService.all.mockResolvedValue(industries);

      const schoolTeacher = professionFactory.build({
        name: 'Secondary School Teacher',
        industries: [industry1],
      });
      const trademarkAttorney = professionFactory.build({
        name: 'Trademark Attorney',
        industries: [industry2, industry3],
      });
      professionsService.allConfirmed.mockResolvedValue([
        schoolTeacher,
        trademarkAttorney,
      ]);

      const result = await controller.create({
        keywords: 'Trademark',
        industries: [],
        nations: [],
      });

      const expected = await new SearchPresenter(
        {
          keywords: 'Trademark',
          industries: [],
          nations: [],
        },
        Nation.all(),
        industries,
        [trademarkAttorney],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });

    it('should return unfiltered professions when no search parameters are specified', async () => {
      const industry1 = industryFactory.build();
      const industry2 = industryFactory.build();
      const industries = [industry1, industry2];
      industriesService.all.mockResolvedValue(industries);

      const schoolTeacher = professionFactory.build({
        name: 'Secondary School Teacher',
        industries: [industry1],
      });
      const trademarkAttorney = professionFactory.build({
        name: 'Trademark Attorney',
        industries: [industry2],
      });

      professionsService.allConfirmed.mockResolvedValue([
        schoolTeacher,
        trademarkAttorney,
      ]);

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
        [schoolTeacher, trademarkAttorney],
        i18nService,
      ).present();

      expect(result).toEqual(expected);
    });
  });
});

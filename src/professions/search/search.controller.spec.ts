import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

import { Nation } from '../../nations/nation';
import { IndustriesService } from '../../industries/industries.service';
import { SearchController } from './search.controller';
import { SearchPresenter } from './search.presenter';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { ProfessionVersionsService } from '../profession-versions.service';
import { RegulationType } from '../profession-version.entity';
import { FilterInput } from '../../common/interfaces/filter-input.interface';

describe('SearchController', () => {
  let controller: SearchController;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let i18nService: DeepMocked<I18nService>;
  let request: DeepMocked<Request> = createMock<Request>();

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();
    industriesService = createMock<IndustriesService>();

    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
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
    describe('when no parameters are provided', () => {
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
        professionVersionsService.searchLive.mockResolvedValue([
          schoolTeacher,
          trademarkAttorney,
        ]);

        const result = await controller.index(
          {
            keywords: '',
            nations: [],
            industries: [],
            regulationTypes: [],
          },
          request,
        );

        const expected = await new SearchPresenter(
          {
            keywords: '',
            nations: [],
            industries: [],
            regulationTypes: [],
          },
          Nation.all(),
          industries,
          [schoolTeacher, trademarkAttorney],
          i18nService,
        ).present();

        expect(result).toEqual(expected);
      });

      it('should request only complete professions from `ProfessionsService`', async () => {
        await controller.index(
          {
            keywords: '',
            nations: [],
            industries: [],
            regulationTypes: [],
          },
          request,
        );

        expect(professionVersionsService.searchLive).toHaveBeenCalled();
      });
    });

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

      professionVersionsService.searchLive.mockResolvedValue([
        schoolTeacher,
        trademarkAttorney,
      ]);

      const result = await controller.index(
        {
          keywords: 'example search',
          nations: ['GB-SCT'],
          industries: [industry1.id, industry2.id],
          regulationTypes: [RegulationType.Certification],
        },
        request,
      );

      const expected = await new SearchPresenter(
        {
          keywords: 'example search',
          nations: [Nation.find('GB-SCT')],
          industries: [industry1, industry2],
          regulationTypes: [RegulationType.Certification],
        },
        Nation.all(),
        industries,
        [schoolTeacher, trademarkAttorney],
        i18nService,
      ).present();

      expect(result).toEqual(expected);

      expect(professionVersionsService.searchLive).toHaveBeenCalledWith({
        keywords: 'example search',
        nations: [Nation.find('GB-SCT')],
        industries: [industry1, industry2],
        regulationTypes: [RegulationType.Certification],
      } as FilterInput);
    });

    it('should call the search service with the provided filters', async () => {
      const industry1 = industryFactory.build();
      const industry2 = industryFactory.build();

      await controller.index(
        {
          keywords: 'example search',
          nations: ['GB-SCT'],
          industries: [industry1.id, industry2.id],
          regulationTypes: [
            RegulationType.Certification,
            RegulationType.Accreditation,
          ],
        },
        request,
      );

      expect(professionVersionsService.searchLive).toHaveBeenCalledWith({
        keywords: 'example search',
        nations: [Nation.find('GB-SCT')],
        industries: [industry1, industry2],
        regulationTypes: [
          RegulationType.Certification,
          RegulationType.Accreditation,
        ],
      } as FilterInput);
    });
  });

  it('should set the searchResultUrl', async () => {
    request = createMock<Request>({
      url: '/search',
    });

    await controller.index(
      {
        keywords: '',
        nations: [],
        industries: [],
        regulationTypes: [],
      },
      request,
    );

    expect(request.session.searchResultUrl).toEqual('/search');
  });
});

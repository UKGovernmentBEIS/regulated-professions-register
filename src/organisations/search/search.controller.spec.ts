import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { Nation } from '../../nations/nation';
import { SearchController } from './search.controller';
import { SearchPresenter } from './search.presenter';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { OrganisationVersionsService } from '../organisation-versions.service';

import { IndustriesService } from '../../industries/industries.service';
import { RegulationType } from '../../professions/profession-version.entity';
import { FilterInput } from '../../common/interfaces/filter-input.interface';

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
  professionToOrganisations: [],
});
const organisation2 = organisationFactory.build({
  name: 'Department for Education',
  professionToOrganisations: [],
});

const industries = [industry1, industry2, industry3];

describe('SearchController', () => {
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let i18nService: DeepMocked<I18nService>;
  let request: DeepMocked<Request> = createMock<Request>();

  let controller: SearchController;

  beforeEach(async () => {
    organisationVersionsService = createMock<OrganisationVersionsService>();
    organisationVersionsService.searchLive.mockResolvedValue([
      organisation1,
      organisation2,
    ]);

    industriesService = createMock<IndustriesService>();
    industriesService.all.mockResolvedValue(industries);

    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
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
    describe('when no parameters are provided', () => {
      it('should return populated template params', async () => {
        const result = await controller.index(
          {
            keywords: '',
            nations: [],
            industries: [],
            regulationTypes: [],
          },
          request,
        );

        const expected = new SearchPresenter(
          {
            keywords: '',
            nations: [],
            industries: [],
            regulationTypes: [],
          },
          Nation.all(),
          industries,
          [organisation1, organisation2],
          i18nService,
        ).present();

        expect(result).toEqual(expected);
      });

      it('should make a search request from `OrganisationVersionsService`', async () => {
        await controller.index(
          {
            keywords: '',
            nations: [],
            industries: [],
            regulationTypes: [],
          },
          request,
        );

        expect(organisationVersionsService.searchLive).toHaveBeenCalledWith({
          keywords: '',
          nations: [],
          industries: [],
          regulationTypes: [],
        } as FilterInput);
      });
    });

    it('should return template params populated with provided search filters', async () => {
      const result = await controller.index(
        {
          keywords: 'example search',
          nations: ['GB-NIR'],
          industries: [industry1.id, industry2.id],
          regulationTypes: [RegulationType.Licensing],
        },
        request,
      );

      const expected = new SearchPresenter(
        {
          keywords: 'example search',
          industries: [industry1, industry2],
          nations: [Nation.find('GB-NIR')],
          regulationTypes: [RegulationType.Licensing],
        },
        Nation.all(),
        industries,
        [organisation1, organisation2],
        i18nService,
      ).present();

      expect(result).toEqual(expected);

      expect(organisationVersionsService.searchLive).toHaveBeenCalledWith({
        keywords: 'example search',
        nations: [Nation.find('GB-NIR')],
        industries: [industry1, industry2],
        regulationTypes: [RegulationType.Licensing],
      } as FilterInput);
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
});

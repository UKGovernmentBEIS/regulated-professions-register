import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from '../organisations.service';
import { Organisation } from '../organisation.entity';

import { OrganisationsPresenter } from './presenters/organisations.presenter';
import { OrganisationPresenter } from '../presenters/organisation.presenter';
import { OrganisationDto } from './dto/organisation.dto';

import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { SummaryList } from '../../common/interfaces/summary-list';
import { ShowTemplate } from '../interfaces/show-template.interface';
import { IndustriesService } from '../../industries/industries.service';
import { IndexTemplate } from './interfaces/index-template.interface';
import { OrganisationsFilterHelper } from '../helpers/organisations-filter.helper';
import industryFactory from '../../testutils/factories/industry';
import { FilterDto } from './dto/filter.dto';
import { FilterInput } from '../../common/interfaces/filter-input.interface';

jest.mock('./presenters/organisations.presenter');
jest.mock('../presenters/organisation.presenter');
jest.mock('../presenters/organisation-summary.presenter');
jest.mock('../helpers/organisations-filter.helper');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;

  let i18nService: I18nService;

  let organisationsService: DeepMocked<OrganisationsService>;
  let industriesService: DeepMocked<IndustriesService>;

  beforeEach(async () => {
    i18nService = createMockI18nService();

    organisationsService = createMock<OrganisationsService>();
    industriesService = createMock<IndustriesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationsController],
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
    }).compile();

    controller = module.get<OrganisationsController>(OrganisationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    describe('when no filter is provided', () => {
      it('should return template params for all organisations', async () => {
        const templateParams: IndexTemplate = {
          organisationsTable: {
            firstCellIsHeader: true,
            head: [{ text: 'Headers' }],
            rows: [
              [{ text: 'Row 1' }],
              [{ text: 'Row 2' }],
              [{ text: 'Row 3' }],
            ],
          },
          filters: {
            keywords: '',
            industries: [],
          },
          industriesCheckboxArgs: [],
        };

        const organisations = createOrganisations();
        const industries = industryFactory.buildList(5);

        (
          OrganisationsPresenter.prototype as DeepMocked<OrganisationsPresenter>
        ).present.mockResolvedValue(templateParams);

        (
          OrganisationsFilterHelper.prototype as DeepMocked<OrganisationsFilterHelper>
        ).filter.mockReturnValue(organisations);

        expect(await controller.index()).toEqual(templateParams);

        expect(organisationsService.allWithProfessions).toHaveBeenCalled();

        expect(OrganisationsFilterHelper).toBeCalledWith(organisations);
        expect(OrganisationsFilterHelper.prototype.filter).toBeCalledWith({
          keywords: '',
          industries: [],
        } as FilterInput);

        expect(OrganisationsPresenter).toHaveBeenCalledWith(
          industries,
          {
            keywords: '',
            industries: [],
          },
          organisations,
          i18nService,
        );
      });
    });

    describe('when a filter is provided', () => {
      it('should return template params for filtered organisations', async () => {
        const templateParams: IndexTemplate = {
          organisationsTable: {
            firstCellIsHeader: true,
            head: [{ text: 'Headers' }],
            rows: [
              [{ text: 'Row 1' }],
              [{ text: 'Row 2' }],
              [{ text: 'Row 3' }],
            ],
          },
          filters: {
            keywords: '',
            industries: [],
          },
          industriesCheckboxArgs: [],
        };

        const organisations = createOrganisations();
        const industries = industryFactory.buildList(5);

        (
          OrganisationsPresenter.prototype as DeepMocked<OrganisationsPresenter>
        ).present.mockResolvedValue(templateParams);

        (
          OrganisationsFilterHelper.prototype as DeepMocked<OrganisationsFilterHelper>
        ).filter.mockReturnValue([organisations[1], organisations[3]]);

        expect(
          await controller.index({
            keywords: 'example keywords',
            industries: [industries[1].id],
          } as FilterDto),
        ).toEqual(templateParams);

        expect(organisationsService.allWithProfessions).toHaveBeenCalled();

        expect(OrganisationsFilterHelper).toBeCalledWith(organisations);
        expect(OrganisationsFilterHelper.prototype.filter).toBeCalledWith({
          keywords: 'example keywords',
          industries: [industries[1]],
        } as FilterInput);

        expect(OrganisationsPresenter).toHaveBeenCalledWith(
          industries,
          {
            keywords: 'example keywords',
            industries: [industries[1]],
          },
          [organisations[1], organisations[3]],
          i18nService,
        );
      });
    });
  });

  describe('show', () => {
    it('should return variables for the show template', async () => {
      const organisation = createOrganisation();
      organisationsService.findBySlugWithProfessions.mockResolvedValue(
        organisation,
      );

      const showTemplate: ShowTemplate = {
        organisation,
        summaryList: {
          classes: 'govuk-summary-list--no-border',
          rows: [],
        },
        professions: [],
      };

      (
        OrganisationSummaryPresenter.prototype as DeepMocked<OrganisationSummaryPresenter>
      ).present.mockResolvedValue(showTemplate);

      expect(await controller.show('slug')).toEqual(showTemplate);

      expect(
        organisationsService.findBySlugWithProfessions,
      ).toHaveBeenCalledWith('slug');

      expect(OrganisationSummaryPresenter).toHaveBeenCalledWith(
        organisation,
        i18nService,
      );
    });
  });

  describe('edit', () => {
    it('should return the organisation', async () => {
      const organisation = createOrganisation();

      organisationsService.find.mockResolvedValue(organisation);

      expect(await controller.edit(organisation.id)).toEqual(organisation);
      expect(organisationsService.find).toHaveBeenCalledWith(organisation.id);
    });
  });

  describe('confirm', () => {
    it('saves the organisation', async () => {
      const summaryList: SummaryList = {
        classes: 'govuk-summary-list--no-border',
        rows: [],
      };

      (
        OrganisationPresenter.prototype as DeepMocked<OrganisationPresenter>
      ).summaryList.mockResolvedValue(summaryList);

      const id = 'some-uuid';

      const organisationDto: OrganisationDto = {
        name: 'Organisation',
        alternateName: '',
        email: 'email@example.com',
        url: 'http://example.com',
        contactUrl: 'http://example.com',
        address: '123 Fake Street',
        telephone: '122356',
        fax: '',
      };

      const organisation = organisationFactory.build();

      const newOrganisation = {
        ...organisation,
        ...organisationDto,
      };

      organisationsService.find.mockResolvedValue(organisation);
      organisationsService.save.mockResolvedValue(newOrganisation);

      const result = await controller.confirm(id, organisationDto);

      expect(organisationsService.save).toHaveBeenCalledWith(
        expect.objectContaining(newOrganisation),
      );

      expect(OrganisationPresenter).toHaveBeenCalledWith(
        newOrganisation,
        i18nService,
      );

      expect(OrganisationPresenter.prototype.summaryList).toHaveBeenCalledWith({
        classes: 'govuk-summary-list',
        removeBlank: false,
        includeName: true,
        includeActions: true,
      });

      expect(result).toEqual({
        ...newOrganisation,
        summaryList: summaryList,
      });
    });
  });

  describe('update', () => {
    it('should update the organisation', async () => {
      const organisation = createOrganisation();
      organisationsService.find.mockResolvedValue(organisation);

      expect(await controller.update('some-uuid')).toEqual(organisation);

      expect(organisationsService.find).toHaveBeenCalledWith('some-uuid');
      expect(organisationsService.save).toHaveBeenCalledWith(organisation);
    });
  });
});

function createOrganisations(): Organisation[] {
  return organisationFactory.buildList(5, {
    professions: professionFactory.buildList(2),
  });
}

function createOrganisation(): Organisation {
  return organisationFactory.build({
    professions: professionFactory.buildList(2),
  });
}

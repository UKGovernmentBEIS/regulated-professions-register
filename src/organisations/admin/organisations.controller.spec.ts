import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from '../organisations.service';
import { Organisation } from '../organisation.entity';
import { Table } from '../../common/interfaces/table';
import { SummaryList } from '../../common/interfaces/summary-list';

import { OrganisationsPresenter } from '../presenters/organisations.presenter';
import { OrganisationPresenter } from '../presenters/organisation.presenter';
import { ProfessionPresenter } from '../../professions/presenters/profession.presenter';

import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';

const mockTable = (): Table => {
  return {
    firstCellIsHeader: true,
    head: [{ text: 'Headers' }],
    rows: [[{ text: 'Row 1' }], [{ text: 'Row 2' }], [{ text: 'Row 3' }]],
  };
};

const mockSummaryList = (): SummaryList => {
  return {
    classes: 'govuk-summary-list--no-border',
    rows: [],
  };
};

const organisationsPresenter = {
  table: mockTable,
};

jest.mock('../presenters/organisations.presenter', () => {
  return {
    OrganisationsPresenter: jest.fn().mockImplementation(() => {
      return organisationsPresenter;
    }),
  };
});

jest.mock('../presenters/organisation.presenter', () => {
  return {
    OrganisationPresenter: jest.fn().mockImplementation(() => {
      return {
        summaryList: mockSummaryList,
      };
    }),
  };
});

jest.mock('../../professions/presenters/profession.presenter', () => {
  return {
    ProfessionPresenter: jest.fn().mockImplementation((profession) => {
      return {
        profession: profession,
        summaryList: mockSummaryList,
      };
    }),
  };
});

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let organisationsService: DeepMocked<OrganisationsService>;
  let organisations: Organisation[];
  let organisation: Organisation;

  const i18nService: DeepMocked<I18nService> = createMock<I18nService>({
    translate: async (key: string) => {
      return key;
    },
  });

  beforeEach(async () => {
    organisations = organisationFactory.buildList(5, {
      professions: professionFactory.buildList(2),
    });

    organisation = organisationFactory.build({
      professions: professionFactory.buildList(2),
    });

    organisationsService = createMock<OrganisationsService>({
      all: async () => {
        return organisations;
      },
      findBySlugWithProfessions: async () => {
        return organisation;
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationsController],
      providers: [
        {
          provide: OrganisationsService,
          useValue: organisationsService,
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
    it('should return a table view of organisations', async () => {
      expect(await controller.index()).toEqual({
        organisationsTable: mockTable(),
      });

      expect(organisationsService.allWithProfessions).toHaveBeenCalled();

      expect(OrganisationsPresenter).toHaveBeenCalledWith(
        organisations,
        i18nService,
      );
    });
  });

  describe('show', () => {
    it('should return variables for the show template', async () => {
      expect(await controller.show('slug')).toEqual({
        backLink: '/admin/organisations',
        organisation: organisation,
        summaryList: mockSummaryList(),
        professions: [
          {
            name: organisation.professions[0].name,
            slug: organisation.professions[0].slug,
            summaryList: mockSummaryList(),
          },
          {
            name: organisation.professions[1].name,
            slug: organisation.professions[1].slug,
            summaryList: mockSummaryList(),
          },
        ],
      });

      expect(
        organisationsService.findBySlugWithProfessions,
      ).toHaveBeenCalledWith('slug');

      expect(OrganisationPresenter).toHaveBeenCalledWith(
        organisation,
        i18nService,
      );

      expect(ProfessionPresenter).toHaveBeenCalledWith(
        organisation.professions[0],
        i18nService,
      );

      expect(ProfessionPresenter).toHaveBeenCalledWith(
        organisation.professions[1],
        i18nService,
      );
    });
  });
});

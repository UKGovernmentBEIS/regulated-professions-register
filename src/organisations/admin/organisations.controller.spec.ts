import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from '../organisations.service';
import { Organisation } from '../organisation.entity';
import { Table } from '../../common/interfaces/table';
import { OrganisationsPresenter } from '../presenters/organisations.presenter';

import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';

const mockTable = (): Table => {
  return {
    firstCellIsHeader: true,
    head: [{ text: 'Headers' }],
    rows: [[{ text: 'Row 1' }], [{ text: 'Row 2' }], [{ text: 'Row 3' }]],
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

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let organisationsService: DeepMocked<OrganisationsService>;
  let organisations: Organisation[];
  const i18nService = createMock<I18nService>();

  beforeEach(async () => {
    organisations = organisationFactory.buildList(5, {
      professions: professionFactory.buildList(2),
    });

    organisationsService = createMock<OrganisationsService>({
      all: async () => {
        return organisations;
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

      expect(organisationsService.all).toHaveBeenCalledWith({
        relations: ['professions', 'professions.industries'],
      });

      expect(OrganisationsPresenter).toHaveBeenCalledWith(
        organisations,
        i18nService,
      );
    });
  });
});

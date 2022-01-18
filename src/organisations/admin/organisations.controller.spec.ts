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
import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';

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

jest.mock('../presenters/organisation-summary.presenter');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let organisationsService: DeepMocked<OrganisationsService>;
  let organisations: Organisation[];
  let organisation: Organisation;

  const i18nService = createMockI18nService();

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
      const expected = await new OrganisationSummaryPresenter(
        organisation,
        '/admin/organisations',
        i18nService,
      ).present();

      expect(await controller.show('slug')).toEqual(expected);

      expect(
        organisationsService.findBySlugWithProfessions,
      ).toHaveBeenCalledWith('slug');

      expect(OrganisationSummaryPresenter).toHaveBeenNthCalledWith(
        2,
        organisation,
        '/admin/organisations',
        i18nService,
      );
    });
  });
});

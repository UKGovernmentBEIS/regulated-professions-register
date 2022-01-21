import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from '../organisations.service';
import { Organisation } from '../organisation.entity';
import { Table } from '../../common/interfaces/table';

import { OrganisationsPresenter } from '../presenters/organisations.presenter';
import { OrganisationPresenter } from '../presenters/organisation.presenter';
import { OrganisationDto } from './dto/organisation.dto';

import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { SummaryList } from '../../common/interfaces/summary-list';

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

const organisationPresenter = {
  summaryList: jest.fn(() => {
    return mockSummaryList();
  }),
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
      return organisationPresenter;
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
      findBySlug: async () => {
        return organisation;
      },
      save: async (organisation) => {
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
        i18nService,
      ).present();

      expect(await controller.show('slug')).toEqual(expected);

      expect(
        organisationsService.findBySlugWithProfessions,
      ).toHaveBeenCalledWith('slug');

      expect(OrganisationSummaryPresenter).toHaveBeenNthCalledWith(
        2,
        organisation,
        i18nService,
      );
    });
  });

  describe('edit', () => {
    it('should return the organisation', async () => {
      expect(await controller.edit('slug')).toEqual(organisation);
    });
  });

  describe('confirm', () => {
    it('saves the organisation', async () => {
      const slug = 'some-slug';
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

      const result = await controller.confirm(slug, organisationDto);
      const newOrganisation = {
        ...organisation,
        ...organisationDto,
      };

      expect(organisationsService.save).toHaveBeenCalledWith(
        expect.objectContaining(newOrganisation),
      );

      expect(OrganisationPresenter).toHaveBeenCalledWith(
        newOrganisation,
        i18nService,
      );

      expect(organisationPresenter.summaryList).toHaveBeenCalledWith({
        classes: 'govuk-summary-list',
        removeBlank: false,
        includeName: true,
        includeActions: true,
      });

      expect(result).toEqual({
        ...newOrganisation,
        summaryList: mockSummaryList(),
      });
    });
  });
});

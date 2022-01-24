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

jest.mock('../presenters/organisations.presenter');
jest.mock('../presenters/organisation.presenter');
jest.mock('../presenters/organisation-summary.presenter');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;

  let organisationsService: DeepMocked<OrganisationsService>;
  let i18nService;

  beforeEach(async () => {
    i18nService = createMockI18nService();

    organisationsService = createMock<OrganisationsService>();

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
      const table: Table = {
        firstCellIsHeader: true,
        head: [{ text: 'Headers' }],
        rows: [[{ text: 'Row 1' }], [{ text: 'Row 2' }], [{ text: 'Row 3' }]],
      };

      (
        OrganisationsPresenter.prototype as DeepMocked<OrganisationsPresenter>
      ).table.mockResolvedValue(table);

      const organisations = createOrganisations();
      organisationsService.allWithProfessions.mockResolvedValue(organisations);

      expect(await controller.index()).toEqual({
        organisationsTable: table,
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
      const organisation = createOrganisation();
      organisationsService.findBySlugWithProfessions.mockResolvedValue(
        organisation,
      );

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
      const organisation = createOrganisation();
      organisationsService.findBySlug.mockResolvedValue(organisation);

      expect(await controller.edit('slug')).toEqual(organisation);
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

      const organisation = createOrganisation();

      const newOrganisation = {
        ...organisation,
        ...organisationDto,
      };

      organisationsService.findBySlug.mockResolvedValue(organisation);
      organisationsService.save.mockResolvedValue(newOrganisation);

      const result = await controller.confirm(slug, organisationDto);

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

import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { OrganisationsController } from './organisations.controller';
import { OrganisationVersionsService } from './organisation-versions.service';
import { Organisation } from './organisation.entity';

import organisationFactory from '../testutils/factories/organisation';
import professionFactory from '../testutils/factories/profession';
import { OrganisationSummaryPresenter } from './presenters/organisation-summary.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';

jest.mock('./presenters/organisation-summary.presenter');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let organisation: Organisation;

  const i18nService = createMockI18nService();

  beforeEach(async () => {
    organisationVersionsService = createMock<OrganisationVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationsController],
      providers: [
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    controller = module.get<OrganisationsController>(OrganisationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('show', () => {
    it('should return variables for the show template', async () => {
      organisation = organisationFactory.build({
        professions: professionFactory.buildList(2),
      });

      organisationVersionsService.findLiveBySlug.mockResolvedValue(
        organisation,
      );

      const expected = await new OrganisationSummaryPresenter(
        organisation,
        i18nService,
      ).present();

      expect(await controller.show('slug')).toEqual(expected);

      expect(organisationVersionsService.findLiveBySlug).toHaveBeenCalledWith(
        'slug',
      );

      expect(OrganisationSummaryPresenter).toHaveBeenNthCalledWith(
        2,
        organisation,
        i18nService,
      );
    });
  });
});

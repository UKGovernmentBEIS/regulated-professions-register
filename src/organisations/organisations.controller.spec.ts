import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';
import { Organisation } from './organisation.entity';

import organisationFactory from '../testutils/factories/organisation';
import professionFactory from '../testutils/factories/profession';
import { OrganisationSummaryPresenter } from './presenters/organisation-summary.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';

jest.mock('./presenters/organisation-summary.presenter');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let organisationsService: DeepMocked<OrganisationsService>;
  let organisation: Organisation;

  const i18nService = createMockI18nService();

  beforeEach(async () => {
    organisation = organisationFactory.build({
      professions: professionFactory.buildList(2),
    });

    organisationsService = createMock<OrganisationsService>({
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
});

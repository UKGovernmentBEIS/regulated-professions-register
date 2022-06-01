import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { OrganisationsController } from './organisations.controller';
import { OrganisationVersionsService } from './organisation-versions.service';
import { Organisation } from './organisation.entity';
import { Profession } from '../professions/profession.entity';
import { ProfessionToOrganisation } from '../professions/profession-to-organisation.entity';

import organisationFactory from '../testutils/factories/organisation';
import professionFactory from '../testutils/factories/profession';
import { OrganisationSummaryPresenter } from './presenters/organisation-summary.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';

import * as getProfessionsFromOrganisationModule from './helpers/get-professions-from-organisation.helper';

jest.mock('./presenters/organisation-summary.presenter');
jest.mock('../professions/profession.entity');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let organisation: Organisation;
  let professions: Profession[];

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
      const professionsForOrganisation = [
        {
          profession: professionFactory.build(),
        },
        {
          profession: professionFactory.build(),
        },
      ] as ProfessionToOrganisation[];

      organisation = organisationFactory.build({
        professionToOrganisations: professionsForOrganisation,
      });
      professions = professionFactory.buildList(5);

      organisationVersionsService.findLiveBySlug.mockResolvedValue(
        organisation,
      );

      const getProfessionsFromOrganisationSpy = jest.spyOn(
        getProfessionsFromOrganisationModule,
        'getProfessionsFromOrganisation',
      );

      getProfessionsFromOrganisationSpy.mockReturnValue(professions);

      (Profession.withLatestLiveVersion as jest.Mock).mockImplementation(
        (profession) => profession,
      );

      const expected = new OrganisationSummaryPresenter(
        organisation,
        professions,
        i18nService,
      ).present(false);

      expect(await controller.show('slug')).toEqual(expected);

      expect(organisationVersionsService.findLiveBySlug).toHaveBeenCalledWith(
        'slug',
      );

      expect(OrganisationSummaryPresenter).toHaveBeenNthCalledWith(
        2,
        organisation,
        professions,
        i18nService,
      );

      expect(getProfessionsFromOrganisationSpy).toHaveBeenCalledWith(
        organisation,
      );
    });
  });
});

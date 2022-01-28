import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';
import { DeepPartial } from 'fishery';

import { OrganisationVersionsController } from './organisation-versions.controller';

import { OrganisationVersionsService } from '../organisation-versions.service';
import { OrganisationsService } from '../organisations.service';

import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import userFactory from '../../testutils/factories/user';

import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';

describe('OrganisationVersionsController', () => {
  let controller: OrganisationVersionsController;

  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;

  beforeEach(async () => {
    organisationsService = createMock<OrganisationsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationVersionsController],
      providers: [
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
        },
      ],
    }).compile();

    controller = module.get<OrganisationVersionsController>(
      OrganisationVersionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('new', () => {
    it('fetches the organisation', async () => {
      const organisation = organisationFactory.build();
      organisationsService.find.mockResolvedValue(organisation);

      const result = await controller.new(organisation.id);

      expect(result).toEqual(organisation);

      expect(organisationsService.find).toHaveBeenCalledWith(organisation.id);
    });
  });

  describe('create', () => {
    it('creates a copy of the latest version of the organisation', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const user = userFactory.build();

      const response = createMock<Response>();
      const request = createMock<RequestWithAppSession>({
        appSession: {
          user: user as DeepPartial<any>,
        },
      });

      organisationVersionsService.findLatestForOrganisationId.mockResolvedValue(
        organisationVersion,
      );
      organisationVersionsService.save.mockResolvedValue(organisationVersion);

      await controller.create(response, request, 'some-uuid');

      expect(organisationVersionsService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: undefined,
          user: user,
          created_at: undefined,
          updated_at: undefined,
          organisation: organisationVersion.organisation,
        }),
      );

      expect(response.redirect).toHaveBeenCalledWith(
        `/admin/organisations/${organisationVersion.organisation.id}/versions/${organisationVersion.id}/edit`,
      );
    });
  });
});

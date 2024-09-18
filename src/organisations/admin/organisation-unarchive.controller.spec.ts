import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import * as checkCanViewOrganisationModule from '../../users/helpers/check-can-view-organisation';
import * as getActingUser from '../../users/helpers/get-acting-user.helper';
import * as escapeModule from '../../helpers/escape.helper';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { OrganisationsService } from '../organisations.service';
import { Organisation } from '../organisation.entity';
import { OrganisationUnarchiveController } from './organisation-unarchive.controller';
import { OrganisationVersionStatus } from '../organisation-version.entity';

jest.mock('../../common/flash-message');
jest.mock('../../users/helpers/check-can-view-organisation');
jest.mock('../../users/helpers/get-acting-user.helper');
jest.mock('../../helpers/escape.helper');

describe('OrganisationUnarchiveController', () => {
  let controller: OrganisationUnarchiveController;

  let organisationsService: DeepMocked<OrganisationsService>;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    organisationsService = createMock<OrganisationsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationUnarchiveController],
      providers: [
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<OrganisationUnarchiveController>(
      OrganisationUnarchiveController,
    );
  });

  describe('new', () => {
    it('fetches the Organisation to render on the page', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation,
      });

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      jest
        .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
        .mockImplementation();

      jest.spyOn(getActingUser, 'getActingUser').mockImplementation();

      const result = await controller.new(organisation.id, version.id, request);

      expect(result).toEqual({
        organisation: Organisation.withVersion(organisation, version),
      });

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith(organisation.id, version.id);
    });

    it('checks the acting user has permission to unarchive the Organisation', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation,
      });

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const checkCanViewOrganisationSpy = jest
        .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
        .mockImplementation();

      await controller.new(organisation.id, version.id, request);

      expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
        request,
        Organisation.withVersion(organisation, version),
      );
    });
  });

  describe('create', () => {
    it('should unarchive the current version', async () => {
      const organisation = organisationFactory.build();

      const currentVersion = organisationVersionFactory.build({
        organisation: organisation,
        status: OrganisationVersionStatus.Archived,
      });

      const versionToUnarchive = organisationVersionFactory.build({
        organisation: organisation,
        status: OrganisationVersionStatus.Archived,
      });

      const unarchivedVersion = organisationVersionFactory.build({
        organisation: organisation,
        status: OrganisationVersionStatus.Draft,
      });

      const user = userFactory.build();

      jest.spyOn(getActingUser, 'getActingUser').mockReturnValue(user);

      jest
        .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
        .mockImplementation();

      const escapeSpy = jest.spyOn(escapeModule, 'escape');

      const req = createDefaultMockRequest({
        user,
      });

      const res = createMock<Response>({});

      const flashMock = flashMessage as jest.Mock;
      flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        currentVersion,
      );
      organisationVersionsService.create.mockResolvedValue(versionToUnarchive);
      organisationVersionsService.unarchive.mockResolvedValue(
        unarchivedVersion,
      );

      await controller.create(req, res, organisation.id, currentVersion.id);

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith(organisation.id, currentVersion.id);

      expect(organisationVersionsService.create).toHaveBeenCalledWith(
        currentVersion,
        user,
      );

      expect(organisationVersionsService.unarchive).toHaveBeenCalledWith(
        versionToUnarchive,
      );

      expect(flashMock).toHaveBeenCalledWith(
        translationOf('organisations.admin.unarchive.confirmation.heading'),
        translationOf('organisations.admin.unarchive.confirmation.body'),
      );

      expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

      expect(escapeSpy).toHaveBeenCalledWith(
        unarchivedVersion.organisation.name,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/organisations/${organisation.id}/versions/${versionToUnarchive.id}`,
      );
    });

    it('checks the acting user has permission to unarchive the Organisation', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });

      const req = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const checkCanViewOrganisationSpy = jest
        .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
        .mockImplementation();

      const getActingUserSpy = jest.spyOn(getActingUser, 'getActingUser');

      const res = createMock<Response>({});

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );
      organisationVersionsService.create.mockResolvedValue(version);
      organisationsService.find.mockResolvedValue(organisation);

      await controller.create(req, res, organisation.id, version.id);

      expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
        req,
        organisation,
      );

      expect(getActingUserSpy).toHaveBeenCalledWith(req);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

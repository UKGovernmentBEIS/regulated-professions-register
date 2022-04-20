import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { escape } from '../../helpers/escape.helper';
import { ProfessionToOrganisation } from '../../professions/profession-to-organisation.entity';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import professionFactory from '../../testutils/factories/profession';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import { checkCanViewOrganisation } from '../../users/helpers/check-can-view-organisation';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';
import { OrganisationArchiveController } from './organisation-archive.controller';

jest.mock('../../common/flash-message');
jest.mock('../../users/helpers/get-acting-user.helper');
jest.mock('../../helpers/escape.helper');
jest.mock('../../users/helpers/check-can-view-organisation');

describe('OrganisationArchiveController', () => {
  let controller: OrganisationArchiveController;

  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationArchiveController],
      providers: [
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

    controller = module.get<OrganisationArchiveController>(
      OrganisationArchiveController,
    );
  });

  describe('new', () => {
    it('fetches the Organisation to render on the page', async () => {
      const profession1 = professionFactory.build({ name: 'profession1' });
      const profession2 = professionFactory.build({ name: 'profession2' });
      const organisation = organisationFactory.build({
        professionToOrganisations: [
          { profession: profession1 },
          { profession: profession2 },
        ] as ProfessionToOrganisation[],
      });
      const version = organisationVersionFactory.build({
        organisation,
      });

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const result = await controller.new(organisation.id, version.id, request);

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith(organisation.id, version.id);
      expect(result).toEqual({
        organisation: Organisation.withVersion(organisation, version),
        professions: [profession1, profession2],
      });
    });

    it('checks the acting user has permission to archive the Organisation', async () => {
      const profession = professionFactory.build({ name: 'profession' });
      const organisation = organisationFactory.build({
        professionToOrganisations: [
          { profession },
        ] as ProfessionToOrganisation[],
      });
      const version = organisationVersionFactory.build({
        organisation,
      });

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.new(organisation.id, version.id, request);

      expect(checkCanViewOrganisation).toHaveBeenCalledWith(
        request,
        Organisation.withVersion(organisation, version),
      );
    });
  });

  describe('delete', () => {
    it('should archive the current version', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });
      const user = userFactory.build();

      const req = createDefaultMockRequest({
        user: userFactory.build(),
      });
      (getActingUser as jest.Mock).mockReturnValue(user);

      const res = createMock<Response>({});

      const flashMock = flashMessage as jest.Mock;
      flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const versionToArchive = organisationVersionFactory.build({
        organisation,
        user,
      });

      organisationVersionsService.create.mockResolvedValue(versionToArchive);

      await controller.delete(req, res, organisation.id, version.id);

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith(organisation.id, version.id);

      expect(organisationVersionsService.create).toHaveBeenCalledWith(
        version,
        user,
      );

      expect(organisationVersionsService.archive).toHaveBeenCalledWith(
        versionToArchive,
        user,
      );

      expect(flashMock).toHaveBeenCalledWith(
        translationOf('organisations.admin.archive.confirmation.heading'),
        translationOf('organisations.admin.archive.confirmation.body'),
      );

      expect(escape).toHaveBeenCalledWith(organisation.name);

      expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/organisations/${organisation.id}/versions/${versionToArchive.id}`,
      );
    });

    it('checks the acting user has permission to archive the Organisation', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });
      const user = userFactory.build();

      const req = createDefaultMockRequest({
        user: userFactory.build(),
      });
      (getActingUser as jest.Mock).mockReturnValue(user);

      const res = createMock<Response>({});

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      await controller.delete(req, res, organisation.id, version.id);

      expect(checkCanViewOrganisation).toHaveBeenCalledWith(req, organisation);
    });
    it('throws BadRequestException when request is made to archive organisation with professions', async () => {
      const profession = professionFactory.build({
        name: 'profession',
      });
      const organisation = organisationFactory.build({
        professionToOrganisations: [
          { profession },
        ] as ProfessionToOrganisation[],
      });
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });

      const req = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const res = createMock<Response>({});

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      await expect(
        controller.delete(req, res, profession.id, version.id),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});

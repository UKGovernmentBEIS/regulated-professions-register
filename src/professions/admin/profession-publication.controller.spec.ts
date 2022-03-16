import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { escape } from '../../helpers/escape.helper';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { ProfessionPublicationController } from './profession-publication.controller';

jest.mock('../../common/flash-message');
jest.mock('../../users/helpers/get-acting-user.helper');
jest.mock('../../helpers/escape.helper');
jest.mock('../../users/helpers/check-can-view-profession');

describe('ProfessionPublicationController', () => {
  let controller: ProfessionPublicationController;

  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionPublicationController],
      providers: [
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<ProfessionPublicationController>(
      ProfessionPublicationController,
    );
  });

  describe('new', () => {
    it('fetches the Profession to render on the page', async () => {
      const profession = professionFactory.build();
      const version = professionVersionFactory.build({
        profession,
      });

      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const result = await controller.new(profession.id, version.id, request);

      expect(
        professionVersionsService.findByIdWithProfession,
      ).toHaveBeenCalledWith(profession.id, version.id);
      expect(result).toEqual({
        profession: Profession.withVersion(profession, version),
      });
    });

    it('checks the acting user has permission to publish the Profession', async () => {
      const profession = professionFactory.build();
      const version = professionVersionFactory.build({
        profession,
      });

      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.new(profession.id, version.id, request);

      expect(checkCanViewProfession).toHaveBeenCalledWith(
        request,
        Profession.withVersion(profession, version),
      );
    });
  });

  describe('create', () => {
    describe('when publishing a brand new Profession', () => {
      it('should set the slug and publish the version', async () => {
        const brandNewProfession = professionFactory.build({ slug: null });
        const version = professionVersionFactory.build({
          profession: brandNewProfession,
        });
        const user = userFactory.build();

        const req = createDefaultMockRequest({
          user: userFactory.build(),
        });
        (getActingUser as jest.Mock).mockReturnValue(user);

        const res = createMock<Response>({});

        const flashMock = flashMessage as jest.Mock;
        flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

        professionVersionsService.findByIdWithProfession.mockResolvedValue(
          version,
        );

        const newVersion = professionVersionFactory.build({
          profession: brandNewProfession,
          user,
        });

        professionsService.find.mockResolvedValue(brandNewProfession);
        professionVersionsService.create.mockResolvedValue(newVersion);

        await controller.create(req, res, brandNewProfession.id, version.id);

        expect(
          professionVersionsService.findByIdWithProfession,
        ).toHaveBeenCalledWith(brandNewProfession.id, version.id);

        expect(professionVersionsService.create).toHaveBeenCalledWith(
          version,
          user,
        );

        expect(professionVersionsService.publish).toHaveBeenCalledWith(
          newVersion,
        );

        expect(professionsService.setSlug).toHaveBeenCalledWith(
          brandNewProfession,
        );

        expect(flashMock).toHaveBeenCalledWith(
          translationOf('professions.admin.publish.confirmation.heading'),
          translationOf('professions.admin.publish.confirmation.body'),
        );

        expect(escape).toHaveBeenCalledWith(brandNewProfession.name);

        expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

        expect(res.redirect).toHaveBeenCalledWith(
          `/admin/professions/${brandNewProfession.id}/versions/${newVersion.id}`,
        );
      });
    });

    describe('when publishing an existing Profession', () => {
      it('should publish the current version', async () => {
        const existingProfession = professionFactory.build({
          slug: 'existing-profession',
        });
        const version = professionVersionFactory.build({
          profession: existingProfession,
        });
        const user = userFactory.build();

        const req = createDefaultMockRequest({
          user: userFactory.build(),
        });
        (getActingUser as jest.Mock).mockReturnValue(user);

        const res = createMock<Response>({});

        const flashMock = flashMessage as jest.Mock;
        flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

        professionVersionsService.findByIdWithProfession.mockResolvedValue(
          version,
        );

        const newVersion = professionVersionFactory.build({
          profession: existingProfession,
          user,
        });

        professionsService.find.mockResolvedValue(existingProfession);

        professionVersionsService.create.mockResolvedValue(newVersion);

        await controller.create(req, res, existingProfession.id, version.id);

        expect(
          professionVersionsService.findByIdWithProfession,
        ).toHaveBeenCalledWith(existingProfession.id, version.id);

        expect(professionVersionsService.create).toHaveBeenCalledWith(
          version,
          user,
        );

        expect(professionVersionsService.publish).toHaveBeenCalledWith(
          newVersion,
        );

        expect(professionsService.setSlug).not.toHaveBeenCalled();

        expect(flashMock).toHaveBeenCalledWith(
          translationOf('professions.admin.publish.confirmation.heading'),
          translationOf('professions.admin.publish.confirmation.body'),
        );

        expect(escape).toHaveBeenCalledWith(existingProfession.name);

        expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

        expect(res.redirect).toHaveBeenCalledWith(
          `/admin/professions/${existingProfession.id}/versions/${newVersion.id}`,
        );
      });
    });

    it('checks the acting user has permissions to publish the Profession', async () => {
      const req = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const res = createMock<Response>({});

      const profession = professionFactory.build();
      const version = professionVersionFactory.build({ profession });

      await controller.create(req, res, profession.id, version.id);

      expect(checkCanViewProfession).toHaveBeenCalledWith(
        req,
        Profession.withVersion(profession, version),
      );
    });
  });
});

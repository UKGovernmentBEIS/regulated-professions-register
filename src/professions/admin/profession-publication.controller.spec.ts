import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';
import { ProfessionPublicationController } from './profession-publication.controller';

jest.mock('../../common/flash-message');
jest.mock('../../users/helpers/get-acting-user.helper');

describe('ProfessionPublicationController', () => {
  let controller: ProfessionPublicationController;

  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionPublicationController],
      providers: [
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

      const result = await controller.new(profession.id, version.id);

      expect(
        professionVersionsService.findByIdWithProfession,
      ).toHaveBeenCalledWith(profession.id, version.id);
      expect(result).toEqual({
        profession: Profession.withVersion(profession, version),
      });
    });
  });

  describe('create', () => {
    it('should publish the current version', async () => {
      const profession = professionFactory.build();
      const version = professionVersionFactory.build({
        profession,
      });
      const user = userFactory.build();

      const req = createDefaultMockRequest();
      (getActingUser as jest.Mock).mockReturnValue(user);

      const res = createMock<Response>({});

      const flashMock = flashMessage as jest.Mock;
      flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        version,
      );

      const newVersion = professionVersionFactory.build({
        profession,
        user,
      });

      professionVersionsService.create.mockResolvedValue(newVersion);

      await controller.create(req, res, profession.id, version.id);

      expect(
        professionVersionsService.findByIdWithProfession,
      ).toHaveBeenCalledWith(profession.id, version.id);

      expect(professionVersionsService.create).toHaveBeenCalledWith(
        version,
        user,
      );

      expect(professionVersionsService.publish).toHaveBeenCalledWith(
        newVersion,
      );

      expect(flashMock).toHaveBeenCalledWith(
        translationOf('professions.admin.publish.confirmation.heading'),
        translationOf('professions.admin.publish.confirmation.body'),
      );

      expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/professions/${profession.id}/versions/${newVersion.id}`,
      );
    });
  });
});

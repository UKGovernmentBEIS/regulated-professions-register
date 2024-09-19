import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
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
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionsService } from '../professions.service';
import { ConfirmationController } from './confirmation.controller';

jest.mock('../../common/flash-message');
jest.mock('../../helpers/escape.helper');
jest.mock('../../users/helpers/check-can-change-profession');

describe('ConfirmationController', () => {
  let controller: ConfirmationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfirmationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    controller = module.get<ConfirmationController>(ConfirmationController);
  });

  describe('confirm', () => {
    describe('when creating a new profession', () => {
      it('"Confirms" the Profession and the Profession Version, then displays a confirmation flash message on the Profession version page', async () => {
        const res = createMock<Response>();
        const req = createDefaultMockRequest({
          user: userFactory.build(),
        });

        const flashMock = flashMessage as jest.Mock;
        flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

        const profession = professionFactory.build({
          id: 'profession-id',
          slug: undefined,
        });
        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        await controller.create(res, req, 'profession-id', 'version-id');

        expect(professionsService.setSlug).toHaveBeenCalledWith(profession);
        expect(professionVersionsService.confirm).toHaveBeenCalledWith(version);

        expect(flashMock).toHaveBeenCalledWith(
          translationOf('professions.admin.create.confirmation.heading'),
          translationOf('professions.admin.create.confirmation.body'),
        );

        expect(escape).toHaveBeenCalledWith(profession.name);

        expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

        expect(res.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id',
        );
      });
    });

    describe('when amending an existing profession', () => {
      it("redirects with the 'amended' query param, 'confirming' the version, but not updating the Profession", async () => {
        const res = createMock<Response>();
        const req = createDefaultMockRequest({
          user: userFactory.build(),
        });

        (escape as jest.Mock).mockImplementation();
        const flashMock = flashMessage as jest.Mock;
        flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

        const existingProfession = professionFactory.build({
          id: 'existing-id',
          slug: 'profession-slug',
        });

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: existingProfession,
        });

        professionsService.findWithVersions.mockResolvedValue(
          existingProfession,
        );
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        await controller.create(res, req, 'existing-id', 'version-id');

        expect(res.redirect).toHaveBeenCalledWith(
          '/admin/professions/existing-id/versions/version-id',
        );
        expect(professionsService.setSlug).not.toHaveBeenCalled();
        expect(professionVersionsService.confirm).toHaveBeenCalledWith(version);

        expect(flashMock).toHaveBeenCalledWith(
          translationOf('professions.admin.update.confirmation.heading'),
          translationOf('professions.admin.update.confirmation.body'),
        );

        expect(escape).toHaveBeenCalledWith(existingProfession.name);

        expect(req.flash).toHaveBeenCalledWith('info', 'STUB_FLASH_MESSAGE');
      });
    });

    it('checks the user has permissions to confirm the Profession', async () => {
      const res = createMock<Response>();
      const req = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const profession = professionFactory.build();
      const version = professionVersionFactory
        .justCreated('version-id')
        .build({ profession: profession });

      professionsService.findWithVersions.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);

      await controller.create(res, req, 'profession-id', 'version-id');

      expect(checkCanChangeProfession).toHaveBeenCalledWith(req, profession);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

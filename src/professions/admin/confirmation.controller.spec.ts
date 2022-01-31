import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionsService } from '../professions.service';
import { ConfirmationController } from './confirmation.controller';

describe('ConfirmationController', () => {
  let controller: ConfirmationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfirmationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
      ],
    }).compile();

    controller = module.get<ConfirmationController>(ConfirmationController);
  });

  describe('viewConfirmation', () => {
    it('looks up the Profession from the ID in the session, and returns its name and passes in the "amended" status', async () => {
      const amendedQueryParam = false;
      const profession = professionFactory.build({
        name: 'Gas Safe Engineer',
        id: 'profession-id',
        confirmed: true,
      });
      const version = professionVersionFactory.build({
        profession: profession,
      });

      professionsService.find.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);

      expect(
        await controller.new('profession-id', 'version-id', amendedQueryParam),
      ).toEqual({
        name: 'Gas Safe Engineer',
        amended: false,
      });
    });
  });

  describe('confirm', () => {
    describe('when creating a new profession', () => {
      it('"Confirms" the Profession and the Profession Version', async () => {
        const res = createMock<Response>();

        const profession = professionFactory.build({
          id: 'profession-id',
          confirmed: false,
        });
        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        await controller.create(res, 'profession-id', 'version-id');

        expect(professionsService.confirm).toHaveBeenCalledWith(profession);
        expect(professionVersionsService.confirm).toHaveBeenCalledWith(version);
      });
    });

    describe('when amending an existing profession', () => {
      it("redirects with the 'amended' query param, 'confirming' the version, but not updating the Profession", async () => {
        const existingProfession = professionFactory.build({
          id: 'existing-id',
          confirmed: true,
        });

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: existingProfession,
        });

        professionsService.findWithVersions.mockResolvedValue(
          existingProfession,
        );

        const res = createMock<Response>();

        await controller.create(res, 'existing-id', 'version-id');

        expect(res.redirect).toHaveBeenCalledWith(
          `/admin/professions/existing-id/versions/version-id/confirmation?amended=true`,
        );
        expect(professionsService.confirm).not.toHaveBeenCalled;
        expect(professionVersionsService.confirm).toHaveBeenCalledWith(version);
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

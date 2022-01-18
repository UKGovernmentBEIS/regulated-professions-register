import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import professionFactory from '../../testutils/factories/profession';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { ConfirmationController } from './confirmation.controller';

describe('ConfirmationController', () => {
  let controller: ConfirmationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let profession: Profession;

  beforeEach(async () => {
    profession = professionFactory.build({
      id: 'profession-id',
      name: 'Gas Safe Engineer',
    });

    professionsService = createMock<ProfessionsService>({
      find: async () => profession,
      save: async () => profession,
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfirmationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
      ],
    }).compile();

    controller = module.get<ConfirmationController>(ConfirmationController);
  });

  describe('viewConfirmation', () => {
    it('looks up the Profession from the ID in the session, and returns its name and passes in the "amended" status', async () => {
      const amendedQueryParam = false;

      expect(await controller.new('profession-id', amendedQueryParam)).toEqual({
        name: 'Gas Safe Engineer',
        amended: false,
      });
    });
  });

  describe('confirm', () => {
    describe('when creating a new profession', () => {
      it('"Confirms" the Profession', async () => {
        const res = createMock<Response>();

        await controller.create(res, 'profession-id');

        expect(professionsService.confirm).toHaveBeenCalledWith(profession);
      });
    });

    describe('when amending an existing profession', () => {
      it("redirects with the 'amended' query param, not updating the profession", async () => {
        const existingProfession = professionFactory.build({
          id: 'existing-id',
          confirmed: true,
        });

        professionsService.find.mockResolvedValue(existingProfession);

        const res = createMock<Response>();

        await controller.create(res, 'existing-id');

        expect(res.redirect).toHaveBeenCalledWith(
          `/admin/professions/existing-id/confirmation?amended=true`,
        );
        expect(professionsService.confirm).not.toHaveBeenCalled;
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

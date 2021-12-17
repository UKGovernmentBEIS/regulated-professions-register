import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
import { Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { ConfirmationController } from './confirmation.controller';

describe('ConfirmationController', () => {
  let controller: ConfirmationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let industriesService: DeepMocked<IndustriesService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    industriesService = createMock<IndustriesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfirmationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        { provide: IndustriesService, useValue: industriesService },
      ],
    }).compile();

    controller = module.get<ConfirmationController>(ConfirmationController);
  });

  describe('viewConfirmation', () => {
    it('looks up the Profession from the ID in the session, and returns its name', async () => {
      const session = {
        'profession-id': 'profession-id',
      };

      const industry = new Industry('industries.construction');

      const draftProfession = new Profession(
        'Gas Safe Engineer',
        null,
        null,
        null,
        ['GB-ENG'],
        null,
        [industry],
      );

      professionsService.find.mockImplementation(async () => draftProfession);

      expect(await controller.viewConfirmation(session)).toEqual({
        name: 'Gas Safe Engineer',
      });
    });
  });

  describe('confirm', () => {
    describe('when all required fields are present in the session', () => {
      it('"Confirms" the Profession, saving a slug and clears the profession id from the session', async () => {
        const session = {
          'profession-id': 'profession-id',
        };

        const industry = new Industry('industries.construction');

        const draftProfession = new Profession(
          'Gas Safe Engineer',
          null,
          null,
          null,
          ['GB-ENG'],
          null,
          [industry],
        );

        professionsService.find.mockImplementation(async () => draftProfession);

        await controller.confirm(session);

        expect(professionsService.confirm).toHaveBeenCalledWith(
          draftProfession,
        );

        expect(session['profession-id']).toBeUndefined;
      });
    });

    describe('when the session is empty', () => {
      it('should throw an exception', async () => {
        await expect(async () => {
          await controller.confirm({});
        }).rejects.toThrowError();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

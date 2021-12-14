import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
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
    it('looks the name of the profession from the session', async () => {
      const constructionUUID = 'construction-uuid';
      const session = {
        'add-profession': {
          'top-level-details': {
            name: 'Gas Safe Engineer',
            nation: 'england',
            industryId: constructionUUID,
          },
        },
      };

      expect(await controller.viewConfirmation(session)).toEqual({
        name: 'Gas Safe Engineer',
      });
    });
  });

  describe('create', () => {
    describe('when all required fields are present in the session', () => {
      it('creates a Profession, with minimal fields', async () => {
        const constructionUUID = 'construction-uuid';
        const session = {
          'add-profession': {
            'top-level-details': {
              name: 'Gas Safe Engineer',
              nations: ['GB-ENG'],
              industryId: constructionUUID,
            },
          },
        };

        const industry = new Industry('Construction & Engineering');
        industry.id = constructionUUID;

        industriesService.find.mockImplementation(async () => industry);

        await controller.create(session);

        expect(industriesService.find).toHaveBeenCalledWith(constructionUUID);
        expect(professionsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Gas Safe Engineer',
            industries: [industry],
            occupationLocations: ['GB-ENG'],
          }),
        );
      });
    });

    describe('when the session is empty', () => {
      it('should throw an exception', () => {
        expect(async () => {
          await controller.create({});
        }).rejects.toThrowError();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

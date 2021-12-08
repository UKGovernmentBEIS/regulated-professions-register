import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
import { CheckYourAnswersController } from './check-your-answers.controller';

describe('CheckYourAnswersController', () => {
  let controller: CheckYourAnswersController;
  let industriesService: DeepMocked<IndustriesService>;

  beforeEach(async () => {
    industriesService = createMock<IndustriesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckYourAnswersController],
      providers: [{ provide: IndustriesService, useValue: industriesService }],
    }).compile();

    controller = module.get<CheckYourAnswersController>(
      CheckYourAnswersController,
    );
  });

  describe('view', () => {
    it('returns the answers persisted in the session, looking up the Industry name', async () => {
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

      const industry = new Industry('Construction & Engineering');
      industry.id = constructionUUID;

      industriesService.find.mockImplementation(async () => industry);

      expect(await controller.show(session)).toEqual({
        name: 'Gas Safe Engineer',
        nation: 'england',
        industry: 'Construction & Engineering',
      });
      expect(industriesService.find).toHaveBeenCalledWith(constructionUUID);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

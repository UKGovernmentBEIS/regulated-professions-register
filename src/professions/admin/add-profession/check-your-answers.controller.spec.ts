import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
import { CheckYourAnswersController } from './check-your-answers.controller';

describe('CheckYourAnswersController', () => {
  let controller: CheckYourAnswersController;
  let industriesService: DeepMocked<IndustriesService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    industriesService = createMock<IndustriesService>();
    i18nService = createMock<I18nService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckYourAnswersController],
      providers: [
        { provide: IndustriesService, useValue: industriesService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    controller = module.get<CheckYourAnswersController>(
      CheckYourAnswersController,
    );
  });

  describe('view', () => {
    it('returns the answers persisted in the session, looking up the Industry and Nation name', async () => {
      const constructionUUID = 'construction-uuid';
      const session = {
        'add-profession': {
          'top-level-details': {
            name: 'Gas Safe Engineer',
            nations: ['GB-ENG'],
            industries: [constructionUUID],
          },
        },
      };

      const industry = new Industry('industries.construction');
      industry.id = constructionUUID;

      industriesService.findByIds.mockImplementation(async () => [industry]);

      i18nService.translate.mockImplementation(async (text) => {
        switch (text) {
          case 'industries.construction':
            return 'Construction & Engineering';
          case 'nations.england':
            return 'England';
          default:
            return '';
        }
      });

      const templateParams = await controller.show(session);
      expect(templateParams.name).toEqual('Gas Safe Engineer');
      expect(templateParams.nations).toEqual(['England']);
      expect(templateParams.industries).toEqual(['Construction & Engineering']);
      expect(industriesService.findByIds).toHaveBeenCalledWith([
        constructionUUID,
      ]);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

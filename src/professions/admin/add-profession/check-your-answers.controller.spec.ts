import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
import { Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { CheckYourAnswersController } from './check-your-answers.controller';

describe('CheckYourAnswersController', () => {
  let controller: CheckYourAnswersController;
  let professionsService: DeepMocked<ProfessionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    industriesService = createMock<IndustriesService>();
    i18nService = createMock<I18nService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckYourAnswersController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        { provide: IndustriesService, useValue: industriesService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    controller = module.get<CheckYourAnswersController>(
      CheckYourAnswersController,
    );
  });

  describe('view', () => {
    describe('when a Profession has been created with the persisted ID', () => {
      it('fetches the draft Profession from the persisted ID, and renders the answers on the page', async () => {
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
        expect(templateParams.industries).toEqual([
          'Construction & Engineering',
        ]);
        expect(professionsService.find).toHaveBeenCalledWith('profession-id');
      });
    });

    describe('when a Profession with the persisted ID cannot be found', () => {
      it('throws an error', async () => {
        const session = {
          'profession-id': 'profession-id',
        };

        professionsService.find.mockImplementation(async () => undefined);

        await expect(
          async () => await controller.show(session),
        ).rejects.toThrowError('Draft profession not found');

        expect(professionsService.find).toHaveBeenCalledWith('profession-id');
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

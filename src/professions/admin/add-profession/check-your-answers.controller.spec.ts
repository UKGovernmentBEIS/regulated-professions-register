import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../../industries/industry.entity';
import { Organisation } from '../../../organisations/organisation.entity';
import { MandatoryRegistration, Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { CheckYourAnswersController } from './check-your-answers.controller';

describe('CheckYourAnswersController', () => {
  let controller: CheckYourAnswersController;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: DeepMocked<I18nService>;
  let profession: DeepMocked<Profession>;

  beforeEach(async () => {
    profession = createMock<Profession>({
      id: 'profession-id',
      name: 'Gas Safe Engineer',
      occupationLocations: ['GB-ENG'],
      industries: [new Industry('industries.construction')],
      organisation: createMock<Organisation>({
        name: 'Council of Gas Registered Engineers',
      }),
      mandatoryRegistration: MandatoryRegistration.Voluntary,
    });

    professionsService = createMock<ProfessionsService>({
      find: async () => profession,
    });
    i18nService = createMock<I18nService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckYourAnswersController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
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

        const templateParams = await controller.show('profession-id');
        expect(templateParams.name).toEqual('Gas Safe Engineer');
        expect(templateParams.nations).toEqual(['England']);
        expect(templateParams.industries).toEqual([
          'Construction & Engineering',
        ]);
        expect(templateParams.organisation).toEqual(
          'Council of Gas Registered Engineers',
        );
        expect(templateParams.mandatoryRegistration).toEqual(
          MandatoryRegistration.Voluntary,
        );
        expect(professionsService.find).toHaveBeenCalledWith('profession-id');
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import QualificationPresenter from '../../qualifications/presenters/qualification.presenter';
import { createMockRequest } from '../../testutils/create-mock-request';
import industryFactory from '../../testutils/factories/industry';
import legislationFactory from '../../testutils/factories/legislation';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import qualificationFactory from '../../testutils/factories/qualification';
import { MandatoryRegistration } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { CheckYourAnswersController } from './check-your-answers.controller';

describe('CheckYourAnswersController', () => {
  let controller: CheckYourAnswersController;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: DeepMocked<I18nService>;

  const qualification = qualificationFactory.build();
  const legislation = legislationFactory.build({
    url: 'www.gas-legislation.com',
    name: 'Gas Safety Legislation',
  });

  beforeEach(async () => {
    const profession = professionFactory.build({
      id: 'profession-id',
      name: 'Gas Safe Engineer',
      occupationLocations: ['GB-ENG'],
      industries: [industryFactory.build({ name: 'industries.construction' })],
      organisation: organisationFactory.build({
        name: 'Council of Gas Registered Engineers',
      }),
      mandatoryRegistration: MandatoryRegistration.Voluntary,
      description: 'A description of the regulation',
      reservedActivities: 'Some reserved activities',
      qualification,
      legislation,
      confirmed: false,
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
        const request: Request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
        );

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

        const templateParams = await controller.show(
          request,
          'profession-id',
          false,
        );
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
        expect(templateParams.reservedActivities).toEqual(
          'Some reserved activities',
        );
        expect(templateParams.description).toEqual(
          'A description of the regulation',
        );
        expect(templateParams.qualification).toEqual(
          new QualificationPresenter(qualification),
        );
        expect(templateParams.legislation.url).toEqual(
          'www.gas-legislation.com',
        );
        expect(templateParams.legislation.name).toEqual(
          'Gas Safety Legislation',
        );
        expect(templateParams.confirmed).toEqual(false);

        expect(professionsService.find).toHaveBeenCalledWith('profession-id');
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import QualificationPresenter from '../../qualifications/presenters/qualification.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import industryFactory from '../../testutils/factories/industry';
import legislationFactory from '../../testutils/factories/legislation';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import qualificationFactory from '../../testutils/factories/qualification';
import { translationOf } from '../../testutils/translation-of';
import { ProfessionVersionsService } from '../profession-versions.service';
import { MandatoryRegistration } from '../profession-version.entity';
import { ProfessionsService } from '../professions.service';
import { CheckYourAnswersController } from './check-your-answers.controller';

describe('CheckYourAnswersController', () => {
  let controller: CheckYourAnswersController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckYourAnswersController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
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
        const qualification = qualificationFactory.build();

        const legislation1 = legislationFactory.build({
          url: 'www.gas-legislation.com',
          name: 'Gas Safety Legislation',
        });

        const legislation2 = legislationFactory.build({
          url: 'www.another-gas-legislation.com',
          name: 'Another Gas Safety Legislation',
        });

        const profession = professionFactory.build({
          id: 'profession-id',
          name: 'Gas Safe Engineer',
          organisation: organisationFactory.build({
            name: 'Council of Gas Registered Engineers',
          }),
          slug: null,
        });
        professionsService.findWithVersions.mockResolvedValue(profession);

        const version = professionVersionFactory.build({
          occupationLocations: ['GB-ENG'],
          industries: [
            industryFactory.build({ name: 'industries.construction' }),
          ],
          mandatoryRegistration: MandatoryRegistration.Voluntary,
          description: 'A summary of the regulation',
          reservedActivities: 'Some reserved activities',
          protectedTitles: 'Some protected titles',
          regulationUrl: 'http://example.com/regulations',
          registrationRequirements: 'Requirements',
          registrationUrl: 'https://example.com/requirement',
          profession: profession,
          legislations: [legislation1, legislation2],
          qualification: qualification,
        });

        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const templateParams = await controller.show(
          'profession-id',
          'version-id',
          'false',
        );
        expect(templateParams.name).toEqual('Gas Safe Engineer');
        expect(templateParams.nations).toEqual([
          translationOf('nations.england'),
        ]);
        expect(templateParams.industries).toEqual([
          translationOf('industries.construction'),
        ]);
        expect(templateParams.organisation).toEqual(
          'Council of Gas Registered Engineers',
        );
        expect(templateParams.mandatoryRegistration).toEqual(
          MandatoryRegistration.Voluntary,
        );
        expect(templateParams.registrationRequirements).toEqual('Requirements');
        expect(templateParams.registrationUrl).toEqual(
          'https://example.com/requirement',
        );
        expect(templateParams.regulationSummary).toEqual(
          'A summary of the regulation',
        );
        expect(templateParams.reservedActivities).toEqual(
          'Some reserved activities',
        );
        expect(templateParams.protectedTitles).toEqual('Some protected titles');
        expect(templateParams.regulationUrl).toEqual(
          'http://example.com/regulations',
        );
        expect(templateParams.qualification).toEqual(
          new QualificationPresenter(qualification),
        );
        expect(templateParams.legislations[0].url).toEqual(
          'www.gas-legislation.com',
        );
        expect(templateParams.legislations[0].name).toEqual(
          'Gas Safety Legislation',
        );
        expect(templateParams.legislations[1].url).toEqual(
          'www.another-gas-legislation.com',
        );
        expect(templateParams.legislations[1].name).toEqual(
          'Another Gas Safety Legislation',
        );
        expect(templateParams.confirmed).toEqual(false);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'profession-id',
        );
      });
    });

    describe('when the profession has no qualification', () => {
      it('passes a `null` qualification value to the template', async () => {
        const profession = professionFactory.build({
          organisation: organisationFactory.build(),
        });

        const version = professionVersionFactory.build({
          qualification: undefined,
          profession: profession,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const templateParams = await controller.show(
          'profession-id',
          'version-id',
          'false',
        );

        expect(templateParams.qualification).toEqual(null);
      });
    });

    describe('when the profession has only one legislation', () => {
      it('the legislations array passed to the template is padded to length 2', async () => {
        const legislation = legislationFactory.build({
          url: 'www.gas-legislation.com',
          name: 'Gas Safety Legislation',
        });

        const profession = professionFactory.build({
          organisation: organisationFactory.build(),
        });

        const version = professionVersionFactory.build({
          qualification: undefined,
          legislations: [legislation],
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const templateParams = await controller.show(
          'profession-id',
          'version-id',
          'false',
        );

        expect(templateParams.legislations).toEqual([legislation, undefined]);
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

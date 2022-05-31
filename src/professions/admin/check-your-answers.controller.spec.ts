import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { NationsListPresenter } from '../../nations/presenters/nations-list.presenter';
import QualificationPresenter from '../../qualifications/presenters/qualification.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import industryFactory from '../../testutils/factories/industry';
import legislationFactory from '../../testutils/factories/legislation';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import qualificationFactory from '../../testutils/factories/qualification';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import * as getPublicationBlockersModule from '../helpers/get-publication-blockers.helper';
import { RegulationType } from '../profession-version.entity';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';
import { CheckYourAnswersController } from './check-your-answers.controller';
import { ProfessionToOrganisation } from '../profession-to-organisation.entity';
import { ProfessionToOrganisationsPresenter } from './presenters/profession-to-organisations.presenter';
import * as sortLegislationsByIndexModule from '../helpers/sort-legislations-by-index.helper';

jest.mock('../../users/helpers/check-can-change-profession');
jest.mock('../../nations/presenters/nations-list.presenter');

const mockNationsHtml = '<ul><li>Mock nations html</li></ul>';
jest.mock('./presenters/profession-to-organisations.presenter');

describe('CheckYourAnswersController', () => {
  let controller: CheckYourAnswersController;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckYourAnswersController],
      providers: [
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

  describe('show', () => {
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
          professionToOrganisations: [
            {
              organisation: organisationFactory.build({
                name: 'Council of Gas Registered Engineers',
              }),
            },
          ] as ProfessionToOrganisation[],
          slug: null,
        });

        const version = professionVersionFactory.build({
          id: 'version-id',
          occupationLocations: ['GB-ENG'],
          industries: [
            industryFactory.build({ name: 'industries.construction' }),
          ],
          description: 'A summary of the regulation',
          regulationType: RegulationType.Certification,
          reservedActivities: 'Some reserved activities',
          protectedTitles: 'Some protected titles',
          regulationUrl: 'http://example.com/regulations',
          registrationRequirements: 'Requirements',
          registrationUrl: 'https://example.com/requirement',
          profession: profession,
          legislations: [legislation1, legislation2],
          qualification: qualification,
        });

        professionVersionsService.findByIdWithProfession.mockResolvedValue(
          version,
        );
        const getPublicationBlockersSpy = jest
          .spyOn(getPublicationBlockersModule, 'getPublicationBlockers')
          .mockReturnValue([]);
        const sortLegislationsByIndexSpy = jest
          .spyOn(sortLegislationsByIndexModule, 'sortLegislationsByIndex')
          .mockImplementation((legislations) => legislations);

        const user = userFactory.build();

        const expectedSummaryList =
          await new ProfessionToOrganisationsPresenter(
            profession,
            version,
            i18nService,
            user,
          ).summaryLists();

        (
          ProfessionToOrganisationsPresenter.prototype as DeepMocked<ProfessionToOrganisationsPresenter>
        ).summaryLists.mockResolvedValue(expectedSummaryList);

        (NationsListPresenter.prototype.htmlList as jest.Mock).mockReturnValue(
          mockNationsHtml,
        );

        const request = createDefaultMockRequest({
          user: user,
        });

        const templateParams = await controller.show(
          'profession-id',
          'version-id',
          'false',
          request,
        );

        expect(templateParams.name).toEqual('Gas Safe Engineer');
        expect(templateParams.nations).toEqual(mockNationsHtml);
        expect(templateParams.industries).toEqual([
          translationOf('industries.construction'),
        ]);
        expect(templateParams.organisations).toEqual(expectedSummaryList);
        expect(templateParams.registrationRequirements).toEqual('Requirements');
        expect(templateParams.registrationUrl).toEqual(
          'https://example.com/requirement',
        );
        expect(templateParams.regulationSummary).toEqual(
          'A summary of the regulation',
        );
        expect(templateParams.regulationType).toEqual(
          RegulationType.Certification,
        );
        expect(templateParams.reservedActivities).toEqual(
          'Some reserved activities',
        );
        expect(templateParams.protectedTitles).toEqual('Some protected titles');
        expect(templateParams.regulationUrl).toEqual(
          'http://example.com/regulations',
        );
        expect(templateParams.qualification).toEqual(
          new QualificationPresenter(qualification, i18nService),
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
        expect(templateParams.publicationBlockers).toEqual([]);

        expect(
          professionVersionsService.findByIdWithProfession,
        ).toHaveBeenCalledWith('profession-id', 'version-id');
        expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
        expect(sortLegislationsByIndexSpy).toHaveBeenCalledWith(
          version.legislations,
        );
        expect(NationsListPresenter).toHaveBeenCalledWith(
          [Nation.find('GB-ENG')],
          i18nService,
        );
      });
    });

    describe('when the Profession has just been created by a service owner user', () => {
      it('renders a mostly blank check your answers page', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build({
            name: 'Gas Safe Engineer',
            professionToOrganisations: [
              {
                organisation: organisationFactory.build({
                  name: 'Council of Gas Registered Engineers',
                }),
              },
            ] as ProfessionToOrganisation[],
          });

        const version = professionVersionFactory
          .justCreated('version-id')
          .build({
            profession: profession,
            industries: [],
            legislations: [],
          });

        professionVersionsService.findByIdWithProfession.mockResolvedValue(
          version,
        );
        const getPublicationBlockersSpy = jest
          .spyOn(getPublicationBlockersModule, 'getPublicationBlockers')
          .mockReturnValue([
            {
              type: 'incomplete-section',
              section: 'legislation',
            },
          ]);
        const sortLegislationsByIndexSpy = jest
          .spyOn(sortLegislationsByIndexModule, 'sortLegislationsByIndex')
          .mockImplementation((legislations) => legislations);

        (NationsListPresenter.prototype.htmlList as jest.Mock).mockReturnValue(
          mockNationsHtml,
        );
        const user = userFactory.build();

        const expectedSummaryList =
          await new ProfessionToOrganisationsPresenter(
            profession,
            version,
            i18nService,
            user,
          ).summaryLists();

        (
          ProfessionToOrganisationsPresenter.prototype as DeepMocked<ProfessionToOrganisationsPresenter>
        ).summaryLists.mockResolvedValue(expectedSummaryList);

        const request = createDefaultMockRequest({
          user: user,
        });

        const templateParams = await controller.show(
          'profession-id',
          'version-id',
          'false',
          request,
        );

        expect(templateParams.name).toEqual('Gas Safe Engineer');
        expect(templateParams.nations).toEqual(mockNationsHtml);
        expect(templateParams.industries).toEqual([]);
        expect(templateParams.organisations).toEqual(expectedSummaryList);
        expect(templateParams.registrationRequirements).toEqual(undefined);
        expect(templateParams.registrationUrl).toEqual(undefined);
        expect(templateParams.regulationSummary).toEqual(undefined);
        expect(templateParams.regulationType).toEqual(undefined);
        expect(templateParams.reservedActivities).toEqual(undefined);
        expect(templateParams.protectedTitles).toEqual(undefined);
        expect(templateParams.regulationUrl).toEqual(undefined);
        expect(templateParams.qualification).toEqual(
          new QualificationPresenter(undefined, i18nService),
        );
        expect(templateParams.legislations).toEqual([]);
        expect(templateParams.publicationBlockers).toEqual([
          {
            type: 'incomplete-section',
            section: 'legislation',
          },
        ]);

        expect(
          professionVersionsService.findByIdWithProfession,
        ).toHaveBeenCalledWith('profession-id', 'version-id');
        expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
        expect(sortLegislationsByIndexSpy).toHaveBeenCalledWith(
          version.legislations,
        );
        expect(NationsListPresenter).toHaveBeenCalledWith([], i18nService);
      });
    });

    it('checks that the user has permission to view the page', async () => {
      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const profession = professionFactory.build();

      const version = professionVersionFactory.build({
        profession,
      });

      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        version,
      );

      await controller.show('profession-id', 'version-id', 'false', request);

      expect(checkCanChangeProfession).toHaveBeenCalledWith(
        request,
        Profession.withVersion(profession, version),
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

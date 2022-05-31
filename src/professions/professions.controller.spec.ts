import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import industryFactory from '../testutils/factories/industry';
import professionFactory from '../testutils/factories/profession';
import organisationFactory from '../testutils/factories/organisation';
import { translationOf } from '../testutils/translation-of';
import { ProfessionVersionsService } from './profession-versions.service';

import { ProfessionsController } from './professions.controller';

import { Organisation } from '../organisations/organisation.entity';
import * as getGroupedTierOneOrganisationsFromProfessionModule from './helpers/get-grouped-tier-one-organisations-from-profession.helper';
import { GroupedTierOneOrganisations } from './helpers/get-grouped-tier-one-organisations-from-profession.helper';
import * as getOrganisationsFromProfessionByRoleModule from './helpers/get-organisations-from-profession-by-role';

import { NationsListPresenter } from '../nations/presenters/nations-list.presenter';
import { Nation } from '../nations/nation';
import { ShowTemplate } from './interfaces/show-template.interface';
import { OrganisationRole } from './profession-to-organisation.entity';
import { organisationList } from './presenters/organisation-list';
import { DecisionDatasetYearsPresenter } from './presenters/decision-dataset-years.presenter';
import { SummaryList } from '../common/interfaces/summary-list';
import { DecisionDatasetsService } from '../decisions/decision-datasets.service';

jest.mock('../organisations/organisation.entity');
jest.mock('../nations/presenters/nations-list.presenter');
jest.mock('./presenters/decision-dataset-years.presenter');

const mockNationsHtml = '<ul><li>Mock nations html</li></ul>';
const mockDecisionYearsSummaryList = {
  rows: [
    {
      key: { text: 'Year' },
      value: {
        text: '2024',
      },
    },
  ],
} as SummaryList;

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        {
          provide: DecisionDatasetsService,
          useValue: decisionDatasetsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
      controllers: [ProfessionsController],
    }).compile();

    controller = module.get<ProfessionsController>(ProfessionsController);
  });

  describe('show', () => {
    it('should throw an error when the slug does not match a profession', async () => {
      professionVersionsService.findLiveBySlug.mockResolvedValue(null);

      await expect(async () => {
        await controller.show('example-invalid-slug');
      }).rejects.toThrowError(NotFoundException);
    });

    it('should return populated template params', async () => {
      const industry = industryFactory.build({ name: 'industries.example' });
      const profession = professionFactory.build({
        id: 'profession-id',
        name: 'Example Profession',
        occupationLocations: ['GB-ENG'],
        industries: [industry],
      });

      const decisionYears = [2025, 2024, 2023];

      professionVersionsService.findLiveBySlug.mockResolvedValue(profession);
      decisionDatasetsService.allLiveYearsForProfession.mockResolvedValue(
        decisionYears,
      );

      const expectedOrganisations = {} as GroupedTierOneOrganisations;
      const getGroupedTierOneOrganisationsFromProfessionSpy = jest
        .spyOn(
          getGroupedTierOneOrganisationsFromProfessionModule,
          'getGroupedTierOneOrganisationsFromProfession',
        )
        .mockReturnValue(expectedOrganisations);

      const expectedAwardingBodies = organisationFactory.buildList(5);
      const expectedEnforcementBodies = organisationFactory.buildList(3);

      const getOrganisationsFromProfessionByRoleSpy = jest
        .spyOn(
          getOrganisationsFromProfessionByRoleModule,
          'getOrganisationsFromProfessionByRole',
        )
        .mockImplementation((_profession, role) =>
          role === OrganisationRole.AwardingBody
            ? expectedAwardingBodies
            : expectedEnforcementBodies,
        );

      (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
        (organisation) => organisation,
      );

      (NationsListPresenter.prototype.htmlList as jest.Mock).mockReturnValue(
        mockNationsHtml,
      );

      (
        DecisionDatasetYearsPresenter.prototype.summaryList as jest.Mock
      ).mockReturnValue(mockDecisionYearsSummaryList);

      const result = await controller.show('example-slug');

      expect(result).toEqual({
        profession: profession,
        qualifications: await new QualificationPresenter(
          profession.qualification,
          createMockI18nService(),
          expectedAwardingBodies,
        ).summaryList(false, true),
        nations: mockNationsHtml,
        industries: [translationOf('industries.example')],
        enforcementBodies: organisationList(expectedEnforcementBodies),
        organisations: expectedOrganisations,
        decisionYears: mockDecisionYearsSummaryList,
      } as ShowTemplate);

      expect(professionVersionsService.findLiveBySlug).toHaveBeenCalledWith(
        'example-slug',
      );
      expect(
        decisionDatasetsService.allLiveYearsForProfession,
      ).toHaveBeenCalledWith(profession);

      expect(NationsListPresenter).toHaveBeenCalledWith(
        [Nation.find('GB-ENG')],
        i18nService,
      );
      expect(DecisionDatasetYearsPresenter).toHaveBeenCalledWith(
        decisionYears,
        profession,
        i18nService,
      );
      expect(
        DecisionDatasetYearsPresenter.prototype.summaryList,
      ).toHaveBeenCalled();

      expect(
        getGroupedTierOneOrganisationsFromProfessionSpy,
      ).toHaveBeenCalledWith(profession, 'latestLiveVersion');
      expect(getOrganisationsFromProfessionByRoleSpy).toHaveBeenCalledWith(
        profession,
        OrganisationRole.AwardingBody,
        'latestLiveVersion',
      );
      expect(getOrganisationsFromProfessionByRoleSpy).toHaveBeenCalledWith(
        profession,
        OrganisationRole.EnforcementBody,
        'latestLiveVersion',
      );
    });

    describe('publishing with missing data', () => {
      describe('when the Profession has no industries set', () => {
        it('passes an empty array for the industries', async () => {
          const profession = professionFactory.build({
            industries: [],
          });

          professionVersionsService.findLiveBySlug.mockResolvedValue(
            profession,
          );

          (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
            (organisation) => organisation,
          );

          const result = await controller.show('example-slug');

          expect(result).toEqual(
            expect.objectContaining({
              industries: [],
            }),
          );
        });
      });

      describe('when the Profession has no nations set', () => {
        it('passes an empty array for NationsListPresenter', async () => {
          const profession = professionFactory.build({
            occupationLocations: undefined,
          });

          professionVersionsService.findLiveBySlug.mockResolvedValue(
            profession,
          );

          (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
            (organisation) => organisation,
          );

          await controller.show('example-slug');

          expect(NationsListPresenter).toBeCalledWith([], i18nService);
        });
      });

      describe('when the Profession has no qualification set', () => {
        it('passes a null value for the qualification', async () => {
          const profession = professionFactory.build({
            qualification: null,
            occupationLocations: ['GB-ENG'],
            industries: [industryFactory.build({ name: 'industries.example' })],
          });

          professionVersionsService.findLiveBySlug.mockResolvedValue(
            profession,
          );

          const expectedOrganisations = {} as GroupedTierOneOrganisations;

          jest
            .spyOn(
              getGroupedTierOneOrganisationsFromProfessionModule,
              'getGroupedTierOneOrganisationsFromProfession',
            )
            .mockReturnValue(expectedOrganisations);

          (
            NationsListPresenter.prototype.htmlList as jest.Mock
          ).mockReturnValue(mockNationsHtml);

          const result = await controller.show('example-slug');

          expect(result).toEqual({
            profession: profession,
            qualifications: null,
            nations: mockNationsHtml,
            industries: [translationOf('industries.example')],
            organisations: expectedOrganisations,
            enforcementBodies: organisationList([]),
          } as ShowTemplate);
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

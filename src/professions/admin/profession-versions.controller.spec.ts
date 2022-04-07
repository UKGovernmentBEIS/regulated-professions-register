import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from './../profession-to-organisation.entity';
import QualificationPresenter from '../../qualifications/presenters/qualification.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { translationOf } from '../../testutils/translation-of';
import userFactory from '../../testutils/factories/user';
import { ProfessionVersionsController } from './profession-versions.controller';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';
import { ProfessionPresenter } from '../presenters/profession.presenter';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import * as getGroupedTierOneOrganisationsFromProfessionModule from './../helpers/get-grouped-tier-one-organisations-from-profession.helper';
import * as getOrganisationsFromProfessionByRoleModule from './../helpers/get-organisations-from-profession-by-role';
import { GroupedTierOneOrganisations } from './../helpers/get-grouped-tier-one-organisations-from-profession.helper';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';
import * as getPublicationBlockersModule from '../helpers/get-publication-blockers.helper';
import { NationsListPresenter } from '../../nations/presenters/nations-list.presenter';
import { Nation } from '../../nations/nation';
import { ShowTemplate } from './interfaces/show-template.interface';
import { organisationList } from './../presenters/organisation-list';

jest.mock('../../organisations/organisation.entity');
jest.mock('../presenters/profession.presenter');
jest.mock('../../users/helpers/get-acting-user.helper');
jest.mock('../../users/helpers/check-can-view-profession');
jest.mock('../../nations/presenters/nations-list.presenter');

const mockNationsHtml = '<ul><li>Mock nations html</li></ul>';

describe('ProfessionVersionsController', () => {
  let controller: ProfessionVersionsController;

  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionVersionsController],
      providers: [
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<ProfessionVersionsController>(
      ProfessionVersionsController,
    );
  });

  describe('create', () => {
    it('creates a copy of the latest version of the Profession and its Qualification', async () => {
      const previousVersion = professionVersionFactory.build();
      const user = userFactory.build();

      const res = createMock<Response>();
      const req = createDefaultMockRequest({ user: userFactory.build() });
      (getActingUser as jest.Mock).mockReturnValue(user);

      professionVersionsService.findLatestForProfessionId.mockResolvedValue(
        previousVersion,
      );

      const newVersion = professionVersionFactory.build();
      professionVersionsService.create.mockResolvedValue(newVersion);

      await controller.create(res, req, 'some-uuid');

      expect(professionVersionsService.create).toHaveBeenCalledWith(
        previousVersion,
        user,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/professions/${newVersion.profession.id}/versions/${newVersion.id}/check-your-answers?edit=true`,
      );
    });

    it('should check the user has permission to create a new version of the Profession', async () => {
      const profession = professionFactory.build();

      const version = professionVersionFactory.build({
        profession: profession,
        occupationLocations: ['GB-ENG'],
        industries: [industryFactory.build({ name: 'industries.example' })],
      });

      professionVersionsService.findLatestForProfessionId.mockResolvedValue(
        version,
      );

      const res = createMock<Response>();
      const req = createDefaultMockRequest({ user: userFactory.build() });

      await controller.create(res, req, 'some-uuid');

      expect(checkCanViewProfession).toHaveBeenCalledWith(req, profession);
    });
  });

  describe('show', () => {
    it('should throw an error when the slug does not match a profession', async () => {
      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        undefined,
      );

      const request = createDefaultMockRequest({ user: userFactory.build() });

      await expect(async () => {
        await controller.show('profession-id', 'version-id', request);
      }).rejects.toThrowError(NotFoundException);
    });

    it('should check the user has permission to view the profession', async () => {
      const profession = professionFactory.build();

      const version = professionVersionFactory.build({
        profession: profession,
        occupationLocations: ['GB-ENG'],
        industries: [industryFactory.build({ name: 'industries.example' })],
      });

      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        version,
      );
      professionVersionsService.hasLiveVersion.mockResolvedValue(true);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.show('profession-id', 'version-id', request);

      expect(checkCanViewProfession).toHaveBeenCalledWith(
        request,
        Profession.withVersion(profession, version),
      );
    });

    describe('when the Profession is complete', () => {
      it('should return populated template params', async () => {
        const organisation = organisationFactory.build();

        const profession = professionFactory.build({
          professionToOrganisations: [
            {
              organisation: organisation,
              role: OrganisationRole.AdditionalRegulator,
            },
          ] as ProfessionToOrganisation[],
        });

        const version = professionVersionFactory.build({
          profession: profession,
          occupationLocations: ['GB-ENG'],
          industries: [industryFactory.build({ name: 'industries.example' })],
        });

        const professionWithVersion = Profession.withVersion(
          profession,
          version,
        );

        professionVersionsService.findByIdWithProfession.mockResolvedValue(
          version,
        );
        professionVersionsService.hasLiveVersion.mockResolvedValue(true);

        (ProfessionPresenter as jest.Mock).mockReturnValue({});

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

        (
          NationsListPresenter.prototype.htmlList as jest.Mock
        ).mockResolvedValue(mockNationsHtml);

        const getPublicationBlockersSpy = jest
          .spyOn(getPublicationBlockersModule, 'getPublicationBlockers')
          .mockReturnValue([]);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        const result = await controller.show(
          'profession-id',
          'version-id',
          request,
        );

        expect(result).toEqual({
          profession: professionWithVersion,
          presenter: {},
          hasLiveVersion: true,
          qualifications: await new QualificationPresenter(
            professionWithVersion.qualification,
            createMockI18nService(),
            expectedAwardingBodies,
          ).summaryList(true, true),
          nations: mockNationsHtml,
          industries: ['Translation of `industries.example`'],
          organisations: expectedOrganisations,
          enforcementBodies: organisationList(expectedEnforcementBodies),
          publicationBlockers: [],
        } as ShowTemplate);

        expect(
          professionVersionsService.findByIdWithProfession,
        ).toHaveBeenCalledWith('profession-id', 'version-id');
        expect(professionVersionsService.hasLiveVersion).toHaveBeenCalledWith(
          professionWithVersion,
        );
        expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
        expect(NationsListPresenter).toHaveBeenCalledWith(
          [Nation.find('GB-ENG')],
          i18nService,
        );
        expect(
          getGroupedTierOneOrganisationsFromProfessionSpy,
        ).toHaveBeenCalledWith(professionWithVersion, 'latestVersion');
        expect(getOrganisationsFromProfessionByRoleSpy).toHaveBeenCalledWith(
          professionWithVersion,
          OrganisationRole.AwardingBody,
          'latestVersion',
        );
        expect(getOrganisationsFromProfessionByRoleSpy).toHaveBeenCalledWith(
          professionWithVersion,
          OrganisationRole.EnforcementBody,
          'latestVersion',
        );
      });
    });

    describe('when the Profession has no qualification set', () => {
      it('passes a null value for the qualification', async () => {
        const profession = professionFactory.build({});

        const version = professionVersionFactory.build({
          profession,
          occupationLocations: ['GB-ENG'],
          industries: [industryFactory.build({ name: 'industries.example' })],
          qualification: null,
        });

        const professionWithVersion = Profession.withVersion(
          profession,
          version,
        );

        professionVersionsService.findByIdWithProfession.mockResolvedValue(
          version,
        );
        professionVersionsService.hasLiveVersion.mockResolvedValue(true);

        (ProfessionPresenter as jest.Mock).mockReturnValue({});

        const expectedOrganisations = {} as GroupedTierOneOrganisations;
        jest
          .spyOn(
            getGroupedTierOneOrganisationsFromProfessionModule,
            'getGroupedTierOneOrganisationsFromProfession',
          )
          .mockReturnValue(expectedOrganisations);

        (
          NationsListPresenter.prototype.htmlList as jest.Mock
        ).mockResolvedValue(mockNationsHtml);

        const getPublicationBlockersSpy = jest
          .spyOn(getPublicationBlockersModule, 'getPublicationBlockers')
          .mockReturnValue([
            {
              type: 'incomplete-section',
              section: 'qualifications',
            },
          ]);

        const request = createDefaultMockRequest({ user: userFactory.build() });

        const result = await controller.show(
          'profession-id',
          'version-id',
          request,
        );

        expect(result).toEqual({
          profession: professionWithVersion,
          presenter: {},
          hasLiveVersion: true,
          qualifications: await new QualificationPresenter(
            professionWithVersion.qualification,
            createMockI18nService(),
            [],
          ).summaryList(true, true),
          nations: mockNationsHtml,
          industries: [translationOf('industries.example')],
          organisations: expectedOrganisations,
          enforcementBodies: organisationList([]),
          publicationBlockers: [
            {
              type: 'incomplete-section',
              section: 'qualifications',
            },
          ],
        } as ShowTemplate);

        expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
        expect(NationsListPresenter).toHaveBeenCalledWith(
          [Nation.find('GB-ENG')],
          i18nService,
        );
      });
    });

    describe('when the Profession has just been created by a service owner user', () => {
      it('should return populated template params', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build({
            name: 'Example Profession',
          });

        const version = professionVersionFactory
          .justCreated('version-id')
          .build({
            industries: [],
            legislations: [],
            profession: profession,
          });

        const professionWithVersion = Profession.withVersion(
          profession,
          version,
        );

        professionVersionsService.findByIdWithProfession.mockResolvedValue(
          version,
        );
        professionVersionsService.hasLiveVersion.mockResolvedValue(true);

        (ProfessionPresenter as jest.Mock).mockReturnValue({});

        const expectedOrganisations = {} as GroupedTierOneOrganisations;
        jest
          .spyOn(
            getGroupedTierOneOrganisationsFromProfessionModule,
            'getGroupedTierOneOrganisationsFromProfession',
          )
          .mockReturnValue(expectedOrganisations);

        (
          NationsListPresenter.prototype.htmlList as jest.Mock
        ).mockResolvedValue(mockNationsHtml);

        const request = createDefaultMockRequest({ user: userFactory.build() });

        const getPublicationBlockersSpy = jest
          .spyOn(getPublicationBlockersModule, 'getPublicationBlockers')
          .mockReturnValue([
            {
              type: 'incomplete-section',
              section: 'qualifications',
            },
            {
              type: 'incomplete-section',
              section: 'legislation',
            },
          ]);

        const result = await controller.show(
          'profession-id',
          'version-id',
          request,
        );

        expect(result).toEqual({
          profession: professionWithVersion,
          presenter: {},
          hasLiveVersion: true,
          qualifications: await new QualificationPresenter(
            undefined,
            createMockI18nService(),
            [],
          ).summaryList(true, true),
          nations: mockNationsHtml,
          industries: [],
          organisations: expectedOrganisations,
          enforcementBodies: organisationList([]),
          publicationBlockers: [
            {
              type: 'incomplete-section',
              section: 'qualifications',
            },
            {
              type: 'incomplete-section',
              section: 'legislation',
            },
          ],
        } as ShowTemplate);

        expect(
          professionVersionsService.findByIdWithProfession,
        ).toHaveBeenCalledWith('profession-id', 'version-id');
        expect(professionVersionsService.hasLiveVersion).toHaveBeenCalledWith(
          professionWithVersion,
        );
        expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
        expect(NationsListPresenter).toHaveBeenCalledWith([], i18nService);
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

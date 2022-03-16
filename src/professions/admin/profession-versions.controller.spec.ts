import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../../organisations/organisation.entity';
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
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import * as getOrganisationsFromProfessionModule from '../helpers/get-organisations-from-profession.helper';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';
import * as getPublicationBlockersModule from '../helpers/get-publication-blockers.helper';

jest.mock('../../organisations/organisation.entity');
jest.mock('../presenters/profession.presenter');
jest.mock('../../users/helpers/get-acting-user.helper');
jest.mock('../../users/helpers/check-can-view-profession');

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
      describe('when the Profession has a single Organisation', () => {
        it('should return populated template params', async () => {
          const profession = professionFactory.build();

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

          (Organisation.withLatestVersion as jest.Mock).mockImplementation(
            (organisation) => organisation,
          );

          const getOrganisationsFromProfessionSpy = jest.spyOn(
            getOrganisationsFromProfessionModule,
            'getOrganisationsFromProfession',
          );
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
            qualificationSummaryList: await new QualificationPresenter(
              professionWithVersion.qualification,
              createMockI18nService(),
            ).summaryList(true, true),
            nations: ['Translation of `nations.england`'],
            industries: ['Translation of `industries.example`'],
            organisations: [profession.organisation],
            publicationBlockers: [],
          });

          expect(
            professionVersionsService.findByIdWithProfession,
          ).toHaveBeenCalledWith('profession-id', 'version-id');
          expect(professionVersionsService.hasLiveVersion).toHaveBeenCalledWith(
            professionWithVersion,
          );
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            professionWithVersion,
          );
          expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
        });
      });

      describe('when the Profession has an additional Organisation', () => {
        it('should return populated template params', async () => {
          const profession = professionFactory.build({
            additionalOrganisation: organisationFactory.build(),
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

          (Organisation.withLatestVersion as jest.Mock).mockImplementation(
            (organisation) => organisation,
          );

          const getOrganisationsFromProfessionSpy = jest.spyOn(
            getOrganisationsFromProfessionModule,
            'getOrganisationsFromProfession',
          );
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
            qualificationSummaryList: await new QualificationPresenter(
              professionWithVersion.qualification,
              createMockI18nService(),
            ).summaryList(true, true),
            nations: ['Translation of `nations.england`'],
            industries: ['Translation of `industries.example`'],
            organisations: [
              profession.organisation,
              profession.additionalOrganisation,
            ],
            publicationBlockers: [],
          });

          expect(
            professionVersionsService.findByIdWithProfession,
          ).toHaveBeenCalledWith('profession-id', 'version-id');
          expect(professionVersionsService.hasLiveVersion).toHaveBeenCalledWith(
            professionWithVersion,
          );
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            professionWithVersion,
          );
          expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
        });
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

        (Organisation.withLatestVersion as jest.Mock).mockImplementation(
          (organisation) => organisation,
        );
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
          qualificationSummaryList: await new QualificationPresenter(
            professionWithVersion.qualification,
            createMockI18nService(),
          ).summaryList(true, true),
          nations: [translationOf('nations.england')],
          industries: [translationOf('industries.example')],
          organisations: [profession.organisation],
          publicationBlockers: [
            {
              type: 'incomplete-section',
              section: 'qualifications',
            },
          ],
        });

        expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
      });
    });

    describe('when the Profession has just been created by a service owner user', () => {
      it('should return populated template params', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build({
            name: 'Example Profession',
            organisation: organisationFactory.build(),
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

        (Organisation.withLatestVersion as jest.Mock).mockImplementation(
          (organisation) => organisation,
        );

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
          qualificationSummaryList: await new QualificationPresenter(
            undefined,
            createMockI18nService(),
          ).summaryList(true, true),
          nations: [],
          industries: [],
          organisations: [profession.organisation],
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
        });

        expect(
          professionVersionsService.findByIdWithProfession,
        ).toHaveBeenCalledWith('profession-id', 'version-id');
        expect(professionVersionsService.hasLiveVersion).toHaveBeenCalledWith(
          professionWithVersion,
        );
        expect(getPublicationBlockersSpy).toHaveBeenCalledWith(version);
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

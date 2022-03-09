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

jest.mock('../../organisations/organisation.entity');
jest.mock('../presenters/profession.presenter');
jest.mock('../../users/helpers/get-acting-user.helper');

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
      const req = createDefaultMockRequest();
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
  });

  describe('show', () => {
    it('should throw an error when the slug does not match a profession', async () => {
      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        undefined,
      );

      await expect(async () => {
        await controller.show('profession-id', 'version-id');
      }).rejects.toThrowError(NotFoundException);
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

          const result = await controller.show('profession-id', 'version-id');

          expect(result).toEqual({
            profession: professionWithVersion,
            presenter: {},
            hasLiveVersion: true,
            qualificationSummaryList: await new QualificationPresenter(
              professionWithVersion.qualification,
              createMockI18nService(),
            ).summaryList(true, false),
            nations: ['Translation of `nations.england`'],
            industries: ['Translation of `industries.example`'],
            organisations: [profession.organisation],
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

          const result = await controller.show('profession-id', 'version-id');

          expect(result).toEqual({
            profession: professionWithVersion,
            presenter: {},
            hasLiveVersion: true,
            qualificationSummaryList: await new QualificationPresenter(
              professionWithVersion.qualification,
              createMockI18nService(),
            ).summaryList(true, false),
            nations: ['Translation of `nations.england`'],
            industries: ['Translation of `industries.example`'],
            organisations: [
              profession.organisation,
              profession.additionalOrganisation,
            ],
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

        const result = await controller.show('profession-id', 'version-id');

        expect(result).toEqual({
          profession: professionWithVersion,
          presenter: {},
          hasLiveVersion: true,
          qualificationSummaryList: await new QualificationPresenter(
            professionWithVersion.qualification,
            createMockI18nService(),
          ).summaryList(true, false),
          nations: [translationOf('nations.england')],
          industries: [translationOf('industries.example')],
          organisations: [profession.organisation],
        });
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

        const result = await controller.show('profession-id', 'version-id');

        expect(result).toEqual({
          profession: professionWithVersion,
          presenter: {},
          hasLiveVersion: true,
          qualificationSummaryList: await new QualificationPresenter(
            undefined,
            createMockI18nService(),
          ).summaryList(true, false),
          nations: [],
          industries: [],
          organisations: [profession.organisation],
        });

        expect(
          professionVersionsService.findByIdWithProfession,
        ).toHaveBeenCalledWith('profession-id', 'version-id');
        expect(professionVersionsService.hasLiveVersion).toHaveBeenCalledWith(
          professionWithVersion,
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

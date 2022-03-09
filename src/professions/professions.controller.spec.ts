import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import industryFactory from '../testutils/factories/industry';
import professionFactory from '../testutils/factories/profession';
import { translationOf } from '../testutils/translation-of';
import { ProfessionVersionsService } from './profession-versions.service';

import { ProfessionsController } from './professions.controller';

import { Organisation } from '../organisations/organisation.entity';
import organisationFactory from '../testutils/factories/organisation';
import * as getOrganisationsFromProfessionModule from './helpers/get-organisations-from-profession.helper';

jest.mock('../organisations/organisation.entity');

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
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

    describe('when the Profession has a single Organisation', () => {
      it('should return populated template params', async () => {
        const industry = industryFactory.build({ name: 'industries.example' });
        const profession = professionFactory.build({
          id: 'profession-id',
          name: 'Example Profession',
          occupationLocations: ['GB-ENG'],
          industries: [industry],
        });

        professionVersionsService.findLiveBySlug.mockResolvedValue(profession);

        (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
          (organisation) => organisation,
        );

        const getOrganisationsFromProfessionSpy = jest.spyOn(
          getOrganisationsFromProfessionModule,
          'getOrganisationsFromProfession',
        );

        const result = await controller.show('example-slug');

        expect(result).toEqual({
          profession: profession,
          qualificationSummaryList: await new QualificationPresenter(
            profession.qualification,
            createMockI18nService(),
          ).summaryList(false),
          nations: [translationOf('nations.england')],
          industries: [translationOf('industries.example')],
          organisations: [profession.organisation],
        });

        expect(professionVersionsService.findLiveBySlug).toBeCalledWith(
          'example-slug',
        );
        expect(getOrganisationsFromProfessionSpy).toBeCalledWith(profession);
      });
    });

    describe('when the Profession has an additional Organisation', () => {
      it('should return populated template params', async () => {
        const industry = industryFactory.build({ name: 'industries.example' });
        const profession = professionFactory.build({
          id: 'profession-id',
          name: 'Example Profession',
          occupationLocations: ['GB-ENG'],
          industries: [industry],
          additionalOrganisation: organisationFactory.build(),
        });

        professionVersionsService.findLiveBySlug.mockResolvedValue(profession);

        (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
          (organisation) => organisation,
        );

        const getOrganisationsFromProfessionSpy = jest.spyOn(
          getOrganisationsFromProfessionModule,
          'getOrganisationsFromProfession',
        );

        const result = await controller.show('example-slug');

        expect(result).toEqual({
          profession: profession,
          qualificationSummaryList: await new QualificationPresenter(
            profession.qualification,
            createMockI18nService(),
          ).summaryList(false),
          nations: [translationOf('nations.england')],
          industries: [translationOf('industries.example')],
          organisations: [
            profession.organisation,
            profession.additionalOrganisation,
          ],
        });

        expect(professionVersionsService.findLiveBySlug).toBeCalledWith(
          'example-slug',
        );
        expect(getOrganisationsFromProfessionSpy).toBeCalledWith(profession);
      });
    });

    describe('when the Profession has no qualification set', () => {
      it('passes a null value for the qualification', async () => {
        const profession = professionFactory.build({
          qualification: null,
          occupationLocations: ['GB-ENG'],
          industries: [industryFactory.build({ name: 'industries.example' })],
        });

        professionVersionsService.findLiveBySlug.mockResolvedValue(profession);

        (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
          (organisation) => organisation,
        );

        const result = await controller.show('example-slug');

        expect(result).toEqual({
          profession: profession,
          qualificationSummaryList: null,
          nations: [translationOf('nations.england')],
          industries: [translationOf('industries.example')],
          organisations: [profession.organisation],
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

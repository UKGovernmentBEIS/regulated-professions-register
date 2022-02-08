import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../organisations/organisation.entity';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import industryFactory from '../testutils/factories/industry';
import legislationFactory from '../testutils/factories/legislation';
import professionFactory from '../testutils/factories/profession';
import professionVersionFactory from '../testutils/factories/profession-version';
import { translationOf } from '../testutils/translation-of';
import { ProfessionVersionsController } from './profession-versions.controller';
import { ProfessionVersionsService } from './profession-versions.service';
import { ProfessionsService } from './professions.service';

jest.mock('../organisations/organisation.entity');

describe('ProfessionVersionsController', () => {
  let controller: ProfessionVersionsController;

  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionVersionsController],
      providers: [
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
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

  describe('new', () => {
    it('fetches the Profession', async () => {
      const profession = professionFactory.build();
      professionsService.find.mockResolvedValue(profession);

      const result = await controller.edit(profession.id);

      expect(result).toEqual({ profession });

      expect(professionsService.find).toHaveBeenCalledWith(profession.id);
    });
  });

  describe('create', () => {
    it('creates a copy of the latest version of the Profession and its Qualification', async () => {
      const legislation = legislationFactory.build();
      const version = professionVersionFactory.build();

      const updatedQualification = {
        ...version.qualification,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };

      const updatedLegislation = {
        ...legislation,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };

      const response = createMock<Response>();

      professionVersionsService.findLatestForProfessionId.mockResolvedValue(
        version,
      );
      professionVersionsService.save.mockResolvedValue(version);

      await controller.create(response, 'some-uuid');

      expect(professionVersionsService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: undefined,
          status: undefined,
          created_at: undefined,
          updated_at: undefined,
          qualification: updatedQualification,
          legislations: [updatedLegislation],
          profession: version.profession,
        }),
      );

      expect(response.redirect).toHaveBeenCalledWith(
        `/admin/professions/${version.profession.id}/versions/${version.id}/check-your-answers?edit=true`,
      );
    });
  });

  describe('show', () => {
    it('should return populated template params', async () => {
      const profession = professionFactory.build({
        occupationLocations: ['GB-ENG'],
        industries: [industryFactory.build({ name: 'industries.example' })],
      });

      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        profession,
      );

      (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
        () => profession.organisation,
      );

      const result = await controller.show('profession-id', 'version-id');

      expect(result).toEqual({
        profession: profession,
        qualification: new QualificationPresenter(profession.qualification),
        nations: ['Translation of `nations.england`'],
        industries: ['Translation of `industries.example`'],
        organisation: profession.organisation,
      });

      expect(
        professionVersionsService.findByIdWithProfession,
      ).toHaveBeenCalledWith('profession-id', 'version-id');
    });

    it('should throw an error when the slug does not match a profession', () => {
      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        undefined,
      );

      expect(async () => {
        await controller.show('profession-id', 'version-id');
      }).rejects.toThrowError(NotFoundException);
    });

    describe('when the Profession has no qualification set', () => {
      it('passes a null value for the qualification', async () => {
        const profession = professionFactory.build({
          qualification: null,
          occupationLocations: ['GB-ENG'],
          industries: [industryFactory.build({ name: 'industries.example' })],
        });

        professionVersionsService.findByIdWithProfession.mockResolvedValue(
          profession,
        );

        (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
          () => profession.organisation,
        );

        const result = await controller.show('profession-id', 'version-id');

        expect(result).toEqual({
          profession: profession,
          qualification: null,
          nations: [translationOf('nations.england')],
          industries: [translationOf('industries.example')],
          organisation: profession.organisation,
        });
      });
    });
  });
});

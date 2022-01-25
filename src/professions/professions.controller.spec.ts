import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import industryFactory from '../testutils/factories/industry';
import professionFactory from '../testutils/factories/profession';
import { translationOf } from '../testutils/translation-of';

import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
      controllers: [ProfessionsController],
    }).compile();

    controller = module.get<ProfessionsController>(ProfessionsController);
  });

  describe('show', () => {
    it('should return populated template params', async () => {
      const industry = industryFactory.build({ name: 'industries.example' });
      const profession = professionFactory.build({
        id: 'profession-id',
        name: 'Example Profession',
        occupationLocations: ['GB-ENG'],
        industries: [industry],
      });

      professionsService.findBySlug.mockResolvedValue(profession);

      const result = await controller.show('example-slug');

      expect(result).toEqual({
        profession: profession,
        qualification: new QualificationPresenter(profession.qualification),
        nations: [translationOf('nations.england')],
        industries: [translationOf('industries.example')],
      });

      expect(professionsService.findBySlug).toBeCalledWith('example-slug');
    });

    it('should throw an error when the slug does not match a profession', () => {
      professionsService.findBySlug.mockResolvedValue(null);

      expect(async () => {
        await controller.show('example-invalid-slug');
      }).rejects.toThrowError(NotFoundException);
    });

    describe('when the Profession has no qualification set', () => {
      it('passes a null value for the qualification', async () => {
        const profession = professionFactory.build({
          qualification: null,
          occupationLocations: ['GB-ENG'],
          industries: [industryFactory.build({ name: 'industries.example' })],
        });

        professionsService.findBySlug.mockResolvedValue(profession);

        const result = await controller.show('example-slug');

        expect(result).toEqual({
          profession: profession,
          qualification: null,
          nations: [translationOf('nations.england')],
          industries: [translationOf('industries.example')],
        });
      });
    });
  });
});

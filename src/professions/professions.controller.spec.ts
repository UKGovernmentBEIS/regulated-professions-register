import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import industryFactory from '../testutils/factories/industry';
import professionFactory from '../testutils/factories/profession';

import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';

const industry = industryFactory.build({ name: 'industries.example' });
const exampleProfession = professionFactory.build({
  id: 'profession-id',
  name: 'Example Profession',
  occupationLocations: ['GB-ENG'],
  industries: [industry],
});

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>({
      save: async () => {
        return exampleProfession;
      },
    });
    i18nService = createMock<I18nService>();

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('show', () => {
    it('should return populated template params', async () => {
      professionsService.findBySlug.mockImplementationOnce(
        async () => exampleProfession,
      );

      i18nService.translate.mockImplementation(async (text) => {
        switch (text) {
          case 'industries.example':
            return 'Example industry';
          case 'nations.england':
            return 'England';
          default:
            return '';
        }
      });

      const result = await controller.show('example-slug');

      expect(result).toEqual({
        profession: exampleProfession,
        qualification: new QualificationPresenter(
          exampleProfession.qualification,
        ),
        nations: ['England'],
        industries: ['Example industry'],
      });

      expect(professionsService.findBySlug).toBeCalledWith('example-slug');
    });

    it('should throw an error when the slug does not match a profession', () => {
      professionsService.findBySlug.mockImplementationOnce(async () => {
        return null;
      });

      expect(async () => {
        await controller.show('example-invalid-slug');
      }).rejects.toThrowError(NotFoundException);
    });
  });
});

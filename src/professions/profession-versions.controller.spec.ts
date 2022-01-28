import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import legislationFactory from '../testutils/factories/legislation';
import professionFactory from '../testutils/factories/profession';
import professionVersionFactory from '../testutils/factories/profession-version';
import { ProfessionVersionsController } from './profession-versions.controller';
import { ProfessionVersionsService } from './profession-versions.service';
import { ProfessionsService } from './professions.service';

describe('ProfessionVersionsController', () => {
  let controller: ProfessionVersionsController;

  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let professionsService: DeepMocked<ProfessionsService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();

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
});

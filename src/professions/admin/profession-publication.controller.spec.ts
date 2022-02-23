import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';
import { ProfessionPublicationController } from './profession-publication.controller';

describe('ProfessionPublicationController', () => {
  let controller: ProfessionPublicationController;

  let professionVersionsService: DeepMocked<ProfessionVersionsService>;

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionPublicationController],
      providers: [
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
      ],
    }).compile();

    controller = module.get<ProfessionPublicationController>(
      ProfessionPublicationController,
    );
  });

  describe('new', () => {
    it('fetches the Profession to render on the page', async () => {
      const profession = professionFactory.build();
      const version = professionVersionFactory.build({
        profession,
      });

      professionVersionsService.findByIdWithProfession.mockResolvedValue(
        version,
      );

      const result = await controller.new(profession.id, version.id);

      expect(
        professionVersionsService.findByIdWithProfession,
      ).toHaveBeenCalledWith(profession.id, version.id);
      expect(result).toEqual({
        profession: Profession.withVersion(profession, version),
      });
    });
  });
});

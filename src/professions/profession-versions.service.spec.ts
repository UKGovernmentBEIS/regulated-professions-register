import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';

import { In, Repository } from 'typeorm';
import { ProfessionVersionsService } from './profession-versions.service';
import professionVersionFactory from '../testutils/factories/profession-version';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
} from './profession-version.entity';
import professionFactory from '../testutils/factories/profession';

describe('ProfessionVersionsService', () => {
  let service: ProfessionVersionsService;
  let repo: Repository<ProfessionVersion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionVersionsService,
        {
          provide: getRepositoryToken(ProfessionVersion),
          useValue: createMock<Repository<ProfessionVersion>>(),
        },
      ],
    }).compile();

    service = module.get<ProfessionVersionsService>(ProfessionVersionsService);
    repo = module.get<Repository<ProfessionVersion>>(
      getRepositoryToken(ProfessionVersion),
    );
  });

  describe('save', () => {
    it('saves the entity', async () => {
      const professionVersion = professionVersionFactory.build();
      const repoSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(professionVersion);
      const result = await service.save(professionVersion);

      expect(result).toEqual(professionVersion);
      expect(repoSpy).toHaveBeenCalledWith(professionVersion);
    });
  });

  describe('find', () => {
    it('returns a ProfessionVersion', async () => {
      const professionVersion = professionVersionFactory.build();
      const repoSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(professionVersion);
      const result = await service.find('some-uuid');

      expect(result).toEqual(professionVersion);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('findWithProfession', () => {
    it('searches for a ProfessionVersion with its Profession', async () => {
      const version = professionVersionFactory.build();
      const profession = professionFactory.build({ versions: [version] });

      version.profession = profession;

      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(version);

      const result = await service.findWithProfession(version.id);

      expect(result).toEqual(version);

      expect(repoSpy).toHaveBeenCalledWith(version.id, {
        relations: ['profession'],
      });
    });
  });

  describe('findLatestForProfessionId', () => {
    it('searches for the latest Profession with an active status', async () => {
      const profession = professionFactory.build();
      const version = professionVersionFactory.build();

      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(version);

      const result = await service.findLatestForProfessionId(profession.id);

      expect(result).toEqual(version);

      expect(repoSpy).toHaveBeenCalledWith({
        where: {
          profession: { id: profession.id },
          status: In([
            ProfessionVersionStatus.Draft,
            ProfessionVersionStatus.Live,
          ]),
        },
        order: { created_at: 'DESC' },
        relations: ['profession'],
      });
    });
  });
});

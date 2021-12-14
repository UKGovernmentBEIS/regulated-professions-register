import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Industry } from '../industries/industry.entity';
import { Qualification } from '../qualifications/qualification.entity';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';

const profession = new Profession(
  'Registered Gas Engineer',
  'Gas installer/repairer',
  'Gas installers work on gas appliances and installations.',
  'All regions',
  'Reserves of activities',
  new Industry('Construction & Engineering'),
  new Qualification('ATT - Attestation of competence , Art. 11 a'),
  [
    'Gas Safe Register is the official list of gas engineers in the UK, Isle of Man and Guernsey. To work on gas appliances and installations you must be on the gas safe register. The register exists to protect the public from unsafe gas work (EN)',
  ],
);
const professionArray = [
  profession,
  new Profession(
    'Social worker',
    'Social worker',
    'Social workers are trained to: make assessments, taking account of a range of factors',
    'England',
    'Protected title',
    new Industry('Health'),
    new Qualification(
      'PS3 - Diploma of post-secondary level (3-4 years) , Art. 11 d',
    ),
    [
      'England, must be registered with the Health and Care Professions Council (HCPC)',
      'Northern Ireland, must be registered with the Northern Ireland Social Care Council (NISCC)',
    ],
  ),
];

describe('Profession', () => {
  let service: ProfessionsService;
  let repo: Repository<Profession>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionsService,
        {
          provide: getRepositoryToken(Profession),
          useValue: {
            find: () => {
              return professionArray;
            },
            findOne: () => {
              return profession;
            },
            save: () => {
              return profession;
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProfessionsService>(ProfessionsService);
    repo = module.get<Repository<Profession>>(getRepositoryToken(Profession));
  });

  describe('all', () => {
    it('should return all Professions', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const posts = await service.all();

      expect(posts).toEqual(professionArray);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return a Profession', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const post = await service.find('some-uuid');

      expect(post).toEqual(profession);
      expect(repoSpy).toHaveBeenCalledWith('some-uuid');
    });
  });

  describe('save', () => {
    it('should save the Profession', async () => {
      const repoSpy = jest.spyOn(repo, 'save');
      await service.create(profession);

      expect(repoSpy).toHaveBeenCalledWith(profession);
    });
  });
});

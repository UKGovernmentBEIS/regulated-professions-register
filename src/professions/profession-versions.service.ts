import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
} from './profession-version.entity';

@Injectable()
export class ProfessionVersionsService {
  constructor(
    @InjectRepository(ProfessionVersion)
    private repository: Repository<ProfessionVersion>,
  ) {}

  async save(professionVersion: ProfessionVersion): Promise<ProfessionVersion> {
    return this.repository.save(professionVersion);
  }

  async find(id: string): Promise<ProfessionVersion> {
    return this.repository.findOne(id);
  }

  async findWithProfession(id: string): Promise<ProfessionVersion> {
    return this.repository.findOne(id, { relations: ['profession'] });
  }

  async confirm(version: ProfessionVersion): Promise<ProfessionVersion> {
    version.status = ProfessionVersionStatus.Draft;

    return this.repository.save(version);
  }

  async findLatestForProfessionId(
    professionId: string,
  ): Promise<ProfessionVersion> {
    return this.repository.findOne({
      where: {
        profession: { id: professionId },
        status: In([
          ProfessionVersionStatus.Draft,
          ProfessionVersionStatus.Live,
        ]),
      },
      order: { created_at: 'DESC' },
      relations: ['profession'],
    });
  }
}

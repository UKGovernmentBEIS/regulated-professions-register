import { Connection, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Profession } from './profession.entity';
import { generateSlug } from '../helpers/slug.helper';

@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(Profession)
    private repository: Repository<Profession>,
    private connection: Connection,
  ) {}

  all(): Promise<Profession[]> {
    return this.repository.find();
  }

  find(id: string): Promise<Profession> {
    return this.repository.findOne(id);
  }

  findBySlug(slug: string): Promise<Profession> {
    return this.repository.findOne({ where: { slug } });
  }

  async save(user: Profession): Promise<Profession> {
    return this.repository.save(user);
  }

  async confirm(profession: Profession): Promise<Profession> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;

    try {
      let retryCount = 0;

      while (true) {
        const slug = generateSlug(profession.name, retryCount);
        const result = await queryRunner.manager.findOne<Profession>(
          Profession,
          {
            where: { slug },
          },
        );

        if (result) {
          retryCount++;
        } else {
          profession.slug = slug;
          await queryRunner.manager.save(profession);
          await queryRunner.commitTransaction();
          break;
        }
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
    }

    if (error) {
      throw error;
    }

    return profession;
  }
}

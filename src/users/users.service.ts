import { Connection, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { Organisation } from '../organisations/organisation.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
    private connection: Connection,
  ) {}

  async allConfirmed(): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where({ confirmed: true, archived: false })
      .orderBy('LOWER(user.name)')
      .getMany();
  }

  allConfirmedForOrganisation(organisation: Organisation): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where({ confirmed: true, archived: false })
      .leftJoinAndSelect('user.organisation', 'organisation')
      .andWhere('organisation.id = :organisationId', {
        organisationId: organisation.id,
      })
      .orderBy('LOWER(user.name)')
      .getMany();
  }

  find(id: string): Promise<User> {
    return this.repository.findOne(id);
  }

  findByEmail(email: string): Promise<User> {
    return this.repository.findOne({
      where: { email, confirmed: true, archived: false },
    });
  }

  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  findByExternalIdentifier(externalIdentifier: string): Promise<User> {
    return this.repository.findOne({
      where: { externalIdentifier, confirmed: true, archived: false },
    });
  }

  async attemptAdd(user: User): Promise<'user-created' | 'user-exists'> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    let result;

    try {
      const foundUser = await queryRunner.manager.findOne(User, {
        externalIdentifier: user.externalIdentifier,
        confirmed: true,
        archived: false,
      });

      if (!foundUser) {
        await queryRunner.manager.save(User, user);
        result = 'user-created';
      } else {
        result = 'user-exists';
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
    }

    if (error) {
      throw error;
    }

    return result;
  }
}

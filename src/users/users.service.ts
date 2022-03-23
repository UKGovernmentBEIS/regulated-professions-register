import { Connection, Repository, DeleteResult } from 'typeorm';
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

  all(): Promise<User[]> {
    return this.repository.find();
  }

  async allConfirmed(): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.confirmed = true AND user.archived = false')
      .orderBy('LOWER(user.name)')
      .getMany();
  }

  allConfirmedForOrganisation(organisation: Organisation): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.confirmed = true AND user.archived = false')
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
      where: { email },
    });
  }

  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.repository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :id', { id: id })
      .execute();
  }

  findByExternalIdentifier(externalIdentifier: string): Promise<User> {
    return this.repository.findOne({
      where: { externalIdentifier },
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

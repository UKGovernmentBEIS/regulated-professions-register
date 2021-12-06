import { Connection, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
    private connection: Connection,
  ) {}

  all(): Promise<User[]> {
    return this.repository.find();
  }

  find(id: string): Promise<User> {
    return this.repository.findOne(id);
  }

  findByEmail(email: string): Promise<User> {
    return this.repository.findOne({
      where: { email },
    });
  }

  async add(user: User): Promise<void> {
    await this.repository.insert(user);
  }

  findByExternalIdentifier(externalIdentifier: string): Promise<User> {
    return this.repository.findOne({
      where: { identifier: externalIdentifier },
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
        identifier: user.identifier,
      });

      if (!foundUser) {
        await queryRunner.manager.save(user);
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

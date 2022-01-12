import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { InjectData } from '../common/decorators/seeds.decorator';

import { UserPermission, User } from './user.entity';

type SeedUser = {
  email: string;
  name: string;
  externalIdentifier: string;
  permissions: string[];
  serviceOwner: boolean;
  confirmed: boolean;
};

@Injectable()
export class UsersSeeder implements Seeder {
  @InjectData('users')
  data: SeedUser[];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    const users = this.data.map((user) => {
      const permissions = user.permissions as UserPermission[];
      return new User(
        user.email,
        user.name,
        user.externalIdentifier,
        permissions,
        user.serviceOwner,
        user.confirmed,
      );
    });

    return this.userRepository.save(users);
  }

  async drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}

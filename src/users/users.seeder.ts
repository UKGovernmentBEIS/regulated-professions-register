import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { UserRole, User } from './user.entity';

const environment = process.env['NODE_ENV'] || 'development';

type SeedUser = {
  email: string;
  name: string;
  externalIdentifier: string;
  roles: string[];
  confirmed: boolean;
};

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const userData =
      require(`../../seeds/${environment}/users.json`) as SeedUser[];

    const users = userData.map((user) => {
      const roles = user.roles as UserRole[];
      return new User(
        user.email,
        user.name,
        user.externalIdentifier,
        roles,
        user.confirmed,
      );
    });

    return this.userRepository.save(users);
  }

  async drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}

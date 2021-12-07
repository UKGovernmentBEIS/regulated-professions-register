import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';

type SeedUser = {
  email: string;
  name: string;
  externalIdentifier: string;
};

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const userData = require('../../seeds/users.json') as SeedUser[];

    const users = userData.map((user) => {
      return new User(user.email, user.name, user.externalIdentifier);
    });

    return this.userRepository.save(users);
  }

  async drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}

/* eslint-disable @typescript-eslint/no-var-requires */

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    const userData = require('../../seeds/users.json');

    const users: Array<User> = userData.map((user: any) => {
      return new User(user.email, user.name, user.externalIdentifier);
    });

    return this.userRepository.save(users);
  }

  async drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}

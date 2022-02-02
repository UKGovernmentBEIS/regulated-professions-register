import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { InjectData } from '../common/decorators/seeds.decorator';

import { User } from './user.entity';
import { Role } from './role';

type SeedUser = {
  email: string;
  name: string;
  externalIdentifier: string;
  role: Role;
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
    const users = await Promise.all(
      this.data.map(async (user) => {
        const role = user.role as Role;
        const existingUser = await this.userRepository.findOne({
          email: user.email,
        });

        const newUser = new User(
          user.email,
          user.name,
          user.externalIdentifier,
          role,
          user.serviceOwner,
          user.confirmed,
        );

        return { ...existingUser, ...newUser };
      }),
    );

    return this.userRepository.save(users);
  }

  async drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}

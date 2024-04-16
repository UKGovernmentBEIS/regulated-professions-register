import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { InjectData } from '../common/decorators/seeds.decorator';

import { User } from './user.entity';
import { Role } from './role';
import { Organisation } from '../organisations/organisation.entity';

type SeedUser = {
  email: string;
  name: string;
  externalIdentifier: string;
  role: Role;
  serviceOwner: boolean;
  confirmed: boolean;
  organisation: Organisation;
};

@Injectable()
export class UsersSeeder implements Seeder {
  @InjectData('users')
  data: SeedUser[];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
  ) {}

  async seed(): Promise<any> {
    const users = await Promise.all(
      this.data.map(async (user) => {
        const role = user.role as Role;

        const organisation =
          user.organisation &&
          (await this.organisationRepository.findOne({
            where: {
              name: user.organisation.name,
            },
          }));

        const existingUser = await this.userRepository.findOne({
          where: { email: user.email },
        });

        const newUser = new User(
          user.email,
          user.name,
          user.externalIdentifier,
          role,
          user.serviceOwner,
          user.confirmed,
          [],
          organisation,
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

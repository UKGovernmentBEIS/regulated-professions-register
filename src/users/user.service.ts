import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  all(): Promise<User[]> {
    return this.repository.find();
  }

  find(id: string): Promise<User> {
    return this.repository.findOne(id);
  }

  findByExternalIdentifier(externalIdentifier: string): Promise<User> {
    return this.repository.findOne({
      where: { identifier: externalIdentifier },
    });
  }
}

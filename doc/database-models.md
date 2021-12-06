# Database models

We use [TypeORM](https://github.com/typeorm/typeorm) to handle
communication with the database. By convention, we store the
models in the same folder as the module where the controller for
the module is located.

For example, if you have a module called `people` in a folder
called `people`, your model will be stored in a file called
`people.entity.ts`. A TypeORM model looks like this:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // All of our models should have UUIDs as their primary keys
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  // This is not necessary, but makes it easier to create objects
  // for testing purposes
  constructor(firstName?: string, lastName?: string, age?: number) {
    this.firstName = firstName || '';
    this.lastName = lastName || '';
    this.age = age || '';
  }
}
```

To query the model, we need to create a service. This will sit in the
same folder. For our user model, we'll call our service
`user.service.ts`. This will look something like this:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './user.entity.ts';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  all(): Promise<User[]> {
    return this.userRepository.find();
  }

  // More methods (such as find, where, create, update etc go here)
}
```

We can then test our service without touching the database like so:

```typescript
const userArray = [new Person('Name', 'Person', 25), [new Person('Name', 'Person', 25)];

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    // Here we're creating a NestJS module with our UsersService
    // registered as a provider, but we're mocking out the
    // repository, so we can stub the responses.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: () => {
              return userArray;
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('all', () => {
    it('should return all users', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const users = await service.all();

      expect(users).toEqual(userArray);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  // Tests for other methods

}
```

For more information about models in TypeORM,
see the [TypeORM docs](https://github.com/typeorm/typeorm#readme)

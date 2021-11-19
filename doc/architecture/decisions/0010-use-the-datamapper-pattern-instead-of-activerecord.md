# 10. Use the Datamapper pattern instead of ActiveRecord

Date: 2021-11-19

## Status

Accepted

## Summary

We will use the Datamapper pattern, instead of ActiveRecord, as this
will allow us to use some features of NestJS that will allow us to
make our tests more reliable and faster.

## Context

In [9. Use the ActiveRecord Pattern in TypeORM](./0009-use-the-activerecord-pattern-in-typeorm.md)
we made the decision that we were going to use the ActiveRecord
pattern, as opposed to the Datamapper pattern when using TypeORM
models.

However, it has become clear that this is not a good fit for NestJS,
as NestJS makes heavy use of [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection).

With the ActiveRecord pattern, the standard query methods, such as
`find`, `where`, `create`, `update` etc are inherited from a
`BaseEntity`, and any new query methods are defined in the model
itself.

However, the Datamapper pattern, has the model as a thin wrapper that
spells out what variables a database object contains, while much of
the work of querying and adding to the database is done in a service
object.

A service object has the repository injected into it in the
constructor like so:

```typescript
@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private peopleRepository: Repository<Person>,
  ) {}

  all(): Promise<Person[]> {
    return this.peopleRepository.find();
  }

  // Service methods (such as find, where, create, update etc go here)
}
```

The advantage of doing this is that NestJS gives us a convinient
way of mocking dependencies in our tests. With this in mind, it makes
it much easier to unit test our service object without having to
access the database directly. This makes our unit tests faster and
more reliable, with less set up and tear down to worry about. For
example:

```typescript
const peopleArray = [new Person('Name 1', 'email1@example.com'), new Person('Name 2', 'email2@example.com')];

describe('PersonService', () => {
  let service: PersonService;
  let repo: Repository<Person>;

  beforeEach(async () => {
    // Here we're creating a NestJS module with our PersonService
    // registered as a provider, but we're mocking out the
    // repository, so we can stub the responses.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: getRepositoryToken(Person),
          useValue: {
            find: () => {
              return peopleArray;
            },
          },
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    repo = module.get<Repository<Person>>(getRepositoryToken(Person));
  });

  describe('all', () => {
    it('should return all people', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const people = await service.all();

      expect(people).toEqual(peopleArray);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  // Tests for other methods

}
```

## Decision

We have decided to adopt the Datamapper pattern for this project, to
make testing easier and also map more closely to the NestJS way of
doing things. This will reduce friction, make testing easier, and our
unit test suites will be faster.

## Consequences

This is a slight paradigm shift from our usual way of doing things,
but to make this easier, we will update the documentation with
examples, and also make sure the methods we create in our service
objects are closely aligned with patterns that are already used in
ActiveRecord.

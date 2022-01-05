# Seeding data

In order to have an application with a good chunk of initial data to make the app usable in dev,
we provide some seed data, in the `seeds` directory, which has JSON files for each environment.

Seeds are automatically created in the test environment when running the e2e tests. Seed data is
automatically created when running the `script/setup` command, but you can also run:

```bash
npm run seed
```

To wipe the database and reseed, run:

```bash
npm run seed:refresh
```

## Production/Staging

Sometimes it will be necessary to seed data in the production/staging environment. To do this, you
will need to SSH into the application like so (assuming you're logged in GOV.UK PaaS):

```bash
cf ssh beis-rpr-staging
# Or
cf ssh beis-rpr-prod
```

Once you're logged in, you can run:

```bash
NODE_ENV=production /usr/local/bin/node dist/seeder
```

At the moment, we only seed intiial staging / production users, but this may change in future.

## Anatomy of a seeder

Each module that has data to seed has a `*.seeder.ts` file. This looks like this:

```typescript
type SeedPerson = {
  email: string;
  name: string;
};

@Injectable()
export class PeopleSeeder implements Seeder {
  @InjectData('people')
  data: SeedPerson[];

  constructor(
    @InjectRepository(User)
    private readonly personRepository: Repository<Person>,
  ) {}

  async seed(): Promise<any> {
    const people = this.data.map((person) => {
      return new Person(person.email, person.name);
    });

    return this.personRepository.save(people);
  }

  async drop(): Promise<any> {
    return this.personRepository.delete({});
  }
}
```

The `@InjectData('people')` decorator fetches the `person.json` data from the `seeds/ENVIRONMENT`
folder, and defaults to an empty array if the file is not present. The `seed()` method then
cycles through the data that has been fetched and creates a new entity for each one, which it then
saves.

If you're adding a new seeder, it's important to add the seeder and the entity to the list of
seeders at the bottom of `src/seeder.ts` like so:

```typescript
seeder({
  imports: [
    // More imports here
    TypeOrmModule.forFeature([
      // More entities here
      Person,
    ]),
  ],
}).run([
  // More seeders here
  PeopleSeeder,
]);
```

NOTE: Seeders are loaded in order from top to bottom, so you may need to bear this in mind if
your seeder has a dependency on another one.

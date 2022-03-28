# Data migrations

When running a live service sometimes you're required to change existing data in
some way. We do this in a similar way to database migrations, using Data Migrations

The migrations are stored in the src/db/data folder.

To generate a migration, run:

```bash
npm run data:migrate:generate AddThisToThat`
```

This will generate a file in the src/db/data folder. Add the migration
code to the part of the file that says `Add migration code here`, as
well as any relevant imports up top. You can also fetch services
like so:

```typescript
const service = application.get(YourServiceName);
```

And access database repositories like so:

```typescript
const repository = application.get(getRepositoryToken(YourEntityName));
```

To run the data migration:

```typescript
npm run data:migrate ./src/db/data/your-migration-filename.ts
```

When the new code deploys, you'll need to run your migration on the live
service by [running a live console](./accessing-a-live-console.md).

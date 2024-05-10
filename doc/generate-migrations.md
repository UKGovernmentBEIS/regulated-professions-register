# Generate migrations

We use [TypeORM](https://github.com/typeorm/typeorm) to handle
communication with the database.

## Automatically generating migrations

The vast majority of the time, once you've created or made
changes to a [model](./database-models.md), TypeORM will pick up
the changes you have made and automatically generate a migration
when you run:

```bash
npm run typeorm:migration:generate src/db/migrate/YOUR_MIGRATION_NAME
```

This will generate a file in `src/db/migrate` with your changes
automatically reflected.

## Manually generating migrations

To generate a migration, run the command:

```bash
npm run typeorm:migration:create src/db/migrate/YOUR_MIGRATION_NAME
```

This generates a file in `src/db/migrate` in the following format:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class someMigration1637230798783 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
```

For more information on the format of the migrations, see the
[TypeORM docs](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md#using-migration-api-to-write-migrations).

Once you've written your migration, start the server with:

```bash
script/server
```

The migrations will be automatically run.

You can alternatively run the migrations without starting the server with:

```bash
npm run typeorm:migration:run
```

# Generate migrations

We use [TypeORM](https://github.com/typeorm/typeorm) to handle
communication with the database. To generate a migration, run
the command:

```bash
npm run typeorm migration:create -- -n YOUR_MIGRATION_NAME
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

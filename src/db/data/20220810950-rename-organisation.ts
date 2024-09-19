// Run me with `npm run data:migrate ./src/db/data/20220810950-rename-organisation.ts "Old Organisation Name" "New Organisation Name"`

process.env['ENTITIES'] = __dirname + './../../**/*.entity.ts';

import { NestFactory } from '@nestjs/core';
import { argv, exit } from 'process';
import * as readline from 'readline';
import { AppModule } from '../../app.module';
import { OrganisationsService } from '../../organisations/organisations.service';

async function migrate() {
  const oldName = argv?.[2]?.trim();
  const newName = argv?.[3]?.trim();

  if (!(oldName && newName)) {
    console.log(
      'Run me with `npm run data:migrate ./src/db/data/20220810950-rename-organisation.ts "Old Organisation Name" "New Organisation Name"',
    );
    exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const input = await getInteractiveInput(
    `Are you sure you want to rename "${oldName}" to "${newName}"? This will break exisiting links to the organisation's public page! (y/n)`,
  );

  if (input.toLocaleLowerCase() === 'y') {
    const organisationsService =
      app.get<OrganisationsService>(OrganisationsService);

    try {
      const newSlug = await organisationsService.rename(argv[2], argv[3]);

      console.log(
        `"${argv[2]}" successfully renamed to "${argv[3]}". This organisation can now be found at \`/regulatory-authorities/${newSlug}\``,
      );

      exit(0);
    } catch (e) {
      console.log((e as Error).message);
      exit(1);
    }
  } else {
    exit(0);
  }
}

function getInteractiveInput(query): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

migrate();

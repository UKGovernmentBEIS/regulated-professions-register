import * as fs from 'fs';
import { format } from 'date-fns';

async function generateDataMigration() {
  const timestamp = format(new Date(), 'yyyymmddHMS');
  const name = process.argv[2]
    .replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    .substring(1);

  const filename = `${timestamp}-${name}`;
  const path = __dirname + `/../src/db/data/${filename}.ts`;

  const body = `// Run me with \`npm run data:migrate ./src/db/data/${filename}.ts\`

process.env['ENTITIES'] = __dirname + './../../**/*.entity.ts';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

async function migrate() {
  const application = await NestFactory.createApplicationContext(AppModule);

  // Add migration code here

  await application.close();
  process.exit(0);
}

migrate();`;

  fs.writeFile(path, body, { flag: 'a+' }, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log(`Data migration ${filename} created!`);
  });
}

generateDataMigration();

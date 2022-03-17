process.env['ENTITIES'] = __dirname + '/**/*.entity.ts';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProfessionVersionsService } from './professions/profession-versions.service';
import { ProfessionsSearchService } from './professions/professions-search.service';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);

  const command = process.argv[2];

  switch (command) {
    default:
      console.log('Command not found');
      process.exit(1);
  }

  await application.close();
  process.exit(0);
}

bootstrap();

process.env.NODE_ENV ||= 'development';

import { seeder } from 'nestjs-seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';

import { User } from './users/user.entity';
import { UsersSeeder } from './users/users.seeder';

import dbConfiguration from './config/db.config';

seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...(await configService.get('database')),
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
}).run([UsersSeeder]);

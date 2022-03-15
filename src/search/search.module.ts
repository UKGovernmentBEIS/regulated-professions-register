process.env.NODE_ENV ||= 'development';

import { Module, DynamicModule } from '@nestjs/common';
import { OpensearchModule } from 'nestjs-opensearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

import opensearchConfiguration from '../config/opensearch.config';

@Module({})
export class SearchModule {
  static register(): DynamicModule {
    return {
      module: SearchModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [opensearchConfiguration],
        }),
        OpensearchModule.forRootAsync({
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            ...(await configService.get('opensearch')),
          }),
        }),
      ],
      exports: [OpensearchModule],
    };
  }
}

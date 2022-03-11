import { OpensearchClient } from 'nestjs-opensearch';
import { Injectable } from '@nestjs/common';
import { ProfessionVersion } from './profession-version.entity';

@Injectable()
export class ProfessionsSearchService {
  public constructor(private readonly client: OpensearchClient) {}

  public async index(professionVersion: ProfessionVersion): Promise<any> {
    await this.client.index({
      id: professionVersion.id,
      index: 'professions',
      body: {
        name: professionVersion.profession.name,
      },
    });
  }
}

import { OpensearchClient } from 'nestjs-opensearch';
import { Injectable } from '@nestjs/common';
import { ProfessionVersion } from './profession-version.entity';

@Injectable()
export class ProfessionsSearchService {
  readonly indexName: string = `professions_${process.env['NODE_ENV']}`;

  public constructor(private readonly client: OpensearchClient) {}

  public async index(professionVersion: ProfessionVersion): Promise<any> {
    await this.client.index({
      id: professionVersion.id,
      index: this.indexName,
      body: {
        name: professionVersion.profession.name,
      },
    });
  }

  public async delete(professionVersion: ProfessionVersion): Promise<any> {
    await this.client.delete({
      index: this.indexName,
      id: professionVersion.id,
    });
  }
}

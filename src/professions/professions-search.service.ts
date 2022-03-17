import { OpensearchClient } from 'nestjs-opensearch';
import { Injectable } from '@nestjs/common';
import {
  SearchResponse,
  SearchHit,
} from '@opensearch-project/opensearch/api/types';
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
        keywords: professionVersion.keywords,
      },
    });
  }

  public async delete(professionVersion: ProfessionVersion): Promise<any> {
    await this.client.delete({
      index: this.indexName,
      id: professionVersion.id,
    });
  }

  public async bulkDelete(versions: ProfessionVersion[]): Promise<any> {
    const ids = versions.map((version) => version.id);

    await this.client.deleteByQuery({
      index: this.indexName,
      body: {
        query: {
          ids: {
            values: ids,
          },
        },
      },
    });
  }

  public async deleteAll(): Promise<any> {
    await this.client.indices.delete({
      index: this.indexName,
      ignore_unavailable: true,
    });
  }

  public async search(query: string): Promise<string[]> {
    const response = await this.client.search<SearchResponse>({
      index: this.indexName,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['name^4', 'keywords'],
          },
        },
      },
    });

    const hits = response.body.hits.hits;

    return hits.map((hit: SearchHit) => hit._id);
  }
}

import { OpensearchClient } from 'nestjs-opensearch';
import { Injectable } from '@nestjs/common';
import {
  SearchResponse,
  SearchHit,
} from '@opensearch-project/opensearch/api/types';
import { OrganisationVersion } from './organisation-version.entity';

@Injectable()
export class OrganisationsSearchService {
  readonly indexName: string = `organisations_${process.env['NODE_ENV']}`;

  public constructor(private readonly client: OpensearchClient) {}

  public async index(organisationVersion: OrganisationVersion): Promise<any> {
    await this.client.index({
      id: organisationVersion.id,
      index: this.indexName,
      body: {
        name: organisationVersion.organisation.name,
        alternateName: organisationVersion.alternateName,
      },
    });
  }

  public async delete(organisationVersion: OrganisationVersion): Promise<any> {
    await this.client.delete({
      index: this.indexName,
      id: organisationVersion.id,
    });
  }

  public async bulkDelete(versions: OrganisationVersion[]): Promise<any> {
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
            fields: ['name', 'alternateName'],
          },
        },
      },
    });

    const hits = response.body.hits.hits;

    return hits.map((hit: SearchHit) => hit._id);
  }
}

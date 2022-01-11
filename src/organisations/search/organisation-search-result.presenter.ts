import { Organisation } from '../organisation.entity';
import { OrganisationSearchResultTemplate } from './interfaces/organisation-search-result-template.interface';

export class OrganisationSearchResultPresenter {
  constructor(private readonly organisation: Organisation) {}

  async present(): Promise<OrganisationSearchResultTemplate> {
    return {
      name: this.organisation.name,
      slug: this.organisation.slug,
    };
  }
}

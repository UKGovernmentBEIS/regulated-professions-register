import { Factory } from 'fishery';
import { Organisation } from '../../organisations/organisation.entity';
import { OrganisationVersion } from '../../organisations/organisation-version.entity';

import organisationVersionFactory from './organisation-version';
class OrganisationFactory extends Factory<Organisation> {
  withVersion(
    organisationVersion: OrganisationVersion = organisationVersionFactory.build(),
  ) {
    return this.params({
      alternateName: organisationVersion.alternateName,
      address: organisationVersion.address,
      url: organisationVersion.url,
      email: organisationVersion.email,
      telephone: organisationVersion.telephone,
      versionId: organisationVersion.id,
    });
  }
}

export default OrganisationFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Example Organisation',
  slug: 'example-slug',
  professionToOrganisations: undefined,
  users: undefined,
  versions: [],
  created_at: new Date(),
  updated_at: new Date(),
}));

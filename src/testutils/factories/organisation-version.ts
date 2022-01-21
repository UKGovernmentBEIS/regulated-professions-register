import { Factory } from 'fishery';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from '../../organisations/organisation-version.entity';
import organisationFactory from './organisation';
import userFactory from './user';

export default Factory.define<OrganisationVersion>(({ sequence }) => ({
  id: sequence.toString(),
  slug: 'example-slug',
  organisation: organisationFactory.build(),
  user: userFactory.build(),
  status: OrganisationVersionStatus.Draft,
  created_at: new Date(),
  updated_at: new Date(),
}));

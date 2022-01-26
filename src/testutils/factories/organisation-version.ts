import { Factory } from 'fishery';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from '../../organisations/organisation-version.entity';
import organisationFactory from './organisation';
import userFactory from './user';

export default Factory.define<OrganisationVersion>(({ sequence }) => ({
  id: sequence.toString(),
  organisation: organisationFactory.build(),
  user: userFactory.build(),
  status: OrganisationVersionStatus.Draft,
  alternateName: 'Alternate Organisation Name',
  slug: 'example-slug',
  address: '123 Fake Street, London, AB1 2AB, England',
  url: 'https://www.example-org.com',
  email: 'hello@example-org.com',
  contactUrl: 'https://www.example-org.com/contact-us',
  telephone: '+441234567890',
  fax: '+441234567891',
  created_at: new Date(),
  updated_at: new Date(),
}));

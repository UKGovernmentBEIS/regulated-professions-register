import { Factory } from 'fishery';
import { Organisation } from '../../organisations/organisation.entity';

export default Factory.define<Organisation>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Example Organisation',
  alternateName: 'Alternate Organisation Name',
  slug: 'example-slug',
  address: '123 Fake Street, London, AB1 2AB, England',
  url: 'https://www.example-org.com',
  email: 'hello@example-org.com',
  contactUrl: 'https://www.example-org.com/contact-us',
  telephone: '+441234567890',
  fax: '+441234567891',
  professions: undefined,
  created_at: new Date(),
  updated_at: new Date(),
}));

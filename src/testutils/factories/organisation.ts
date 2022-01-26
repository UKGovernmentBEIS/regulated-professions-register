import { Factory } from 'fishery';
import { Organisation } from '../../organisations/organisation.entity';

export default Factory.define<Organisation>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Example Organisation',
  slug: 'example-slug',
  professions: undefined,
  versions: [],
  created_at: new Date(),
  updated_at: new Date(),
}));

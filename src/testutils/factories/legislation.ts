import { Factory } from 'fishery';
import { Legislation } from '../../legislations/legislation.entity';

export default Factory.define<Legislation>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Example legislation',
  url: 'https://www.legislation.example.com',
  created_at: new Date(),
  updated_at: new Date(),
}));

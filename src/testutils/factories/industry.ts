import { Industry } from '../../industries/industry.entity';
import { Factory } from 'fishery';

export default Factory.define<Industry>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Example industry',
  created_at: new Date(),
  updated_at: new Date(),
}));

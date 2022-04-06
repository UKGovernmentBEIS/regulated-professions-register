import { Factory } from 'fishery';
import {
  DecisionDataset,
  DecisionStatus,
} from '../../decisions/decision-dataset.entity';
import organisationFactory from './organisation';
import professionFactory from './profession';
import userFactory from './user';

export default Factory.define<DecisionDataset>(({ sequence }) => ({
  profession: professionFactory.build(),
  organisation: organisationFactory.build(),
  year: sequence,
  status: DecisionStatus.Live,
  routes: [],
  user: userFactory.build(),
  created_at: new Date(),
  updated_at: new Date(),
}));

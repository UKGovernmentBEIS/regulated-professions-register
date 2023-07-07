import { Factory } from 'fishery';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from '../../decisions/decision-dataset.entity';
import organisationFactory from './organisation';
import professionFactory from './profession';
import userFactory from './user';

export default Factory.define<DecisionDataset>(({ sequence }) => ({
  profession: professionFactory.build(),
  organisation: organisationFactory.build(),
  year: sequence,
  status: DecisionDatasetStatus.Live,
  routes: [
    {
      name: 'Example route',
      countries: [
        {
          code: 'GB',
          decisions: {
            yes: 1,
            no: 2,
            yesAfterComp: 3,
            noAfterComp: 4,
            noOtherConditions: 5,
          },
        },
      ],
    },
  ],
  user: userFactory.build(),
  created_at: new Date(),
  updated_at: new Date(),
}));

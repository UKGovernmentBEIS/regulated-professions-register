import { Factory } from 'fishery';
import {
  MandatoryRegistration,
  ProfessionVersion,
  ProfessionVersionStatus,
} from '../../professions/profession-version.entity';
import industryFactory from './industry';
import legislationFactory from './legislation';
import organisationFactory from './organisation';
import professionFactory from './profession';
import qualificationFactory from './qualification';
import userFactory from './user';

export default Factory.define<ProfessionVersion>(({ sequence }) => ({
  id: sequence.toString(),
  alternateName: 'Alternate profession name',
  description:
    'A description of the profession that will be displayed to users',
  occupationLocations: ['GB-ENG'],
  regulationType: 'Reserves of activities',
  mandatoryRegistration: MandatoryRegistration.Mandatory,
  industries: [
    industryFactory.build({ name: 'Example industry', id: 'example-industry' }),
  ],
  qualifications: qualificationFactory.buildList(1),
  legislations: legislationFactory.buildList(1),
  organisation: organisationFactory.build(),
  reservedActivities: 'Stuff',
  profession: professionFactory.build(),
  user: userFactory.build(),
  status: ProfessionVersionStatus.Unconfirmed,
  created_at: new Date(),
  updated_at: new Date(),
}));

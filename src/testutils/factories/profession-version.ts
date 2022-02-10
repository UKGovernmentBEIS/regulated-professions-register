import { Factory } from 'fishery';
import {
  MandatoryRegistration,
  ProfessionVersion,
  ProfessionVersionStatus,
} from '../../professions/profession-version.entity';
import industryFactory from './industry';
import legislationFactory from './legislation';
import professionFactory from './profession';
import qualificationFactory from './qualification';
import userFactory from './user';

class ProfessionVersionFactory extends Factory<ProfessionVersion> {
  justCreated(id: string) {
    return this.params({
      id: id,
      alternateName: undefined,
      description: undefined,
      occupationLocations: undefined,
      regulationType: undefined,
      mandatoryRegistration: undefined,
      industries: undefined,
      qualification: undefined,
      legislations: undefined,
      reservedActivities: undefined,
      profession: undefined,
      user: undefined,
      status: ProfessionVersionStatus.Unconfirmed,
    });
  }
}

export default ProfessionVersionFactory.define(({ sequence }) => ({
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
  qualifications: [],
  qualification: qualificationFactory.build(),
  legislations: legislationFactory.buildList(1),
  reservedActivities: 'Stuff',
  profession: professionFactory.build(),
  user: userFactory.build(),
  status: ProfessionVersionStatus.Unconfirmed,
  created_at: new Date(),
  updated_at: new Date(),
}));

import { Factory } from 'fishery';
import {
  MandatoryRegistration,
  Profession,
} from '../../professions/profession.entity';
import industryFactory from './industry';
import legislationFactory from './legislation';
import qualificationFactory from './qualification';

class ProfessionFactory extends Factory<Profession> {
  justCreated(id: string) {
    return this.params({
      id: id,
      name: undefined,
      alternateName: undefined,
      slug: undefined,
      description: undefined,
      occupationLocations: undefined,
      regulationType: undefined,
      mandatoryRegistration: undefined,
      industries: undefined,
      qualification: undefined,
      confirmed: undefined,
      legislations: undefined,
      legislation: undefined,
      organisation: undefined,
      reservedActivities: undefined,
    });
  }
}

export default ProfessionFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Example Profession',
  alternateName: 'Alternate profession name',
  slug: 'example-slug',
  description:
    'A description of the profession that will be displayed to users',
  occupationLocations: ['GB-ENG'],
  regulationType: 'Reserves of activities',
  mandatoryRegistration: MandatoryRegistration.Mandatory,
  industries: [
    industryFactory.build({ name: 'Example industry', id: 'example-industry' }),
  ],
  qualification: qualificationFactory.build(),
  confirmed: false,
  created_at: new Date(),
  legislations: [],
  legislation: legislationFactory.build(),
  organisation: undefined,
  reservedActivities: 'Stuff',
  updated_at: new Date(),
}));

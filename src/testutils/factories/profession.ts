import { Factory } from 'fishery';
import {
  MandatoryRegistration,
  Profession,
} from '../../professions/profession.entity';
import industryFactory from './industry';
import legislation from './legislation';
import qualificationFactory from './qualification';

export default Factory.define<Profession>(({ sequence }) => ({
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
  legislations: [legislation.build()],
  organisation: undefined,
  reservedActivities: 'Stuff',
  updated_at: new Date(),
}));

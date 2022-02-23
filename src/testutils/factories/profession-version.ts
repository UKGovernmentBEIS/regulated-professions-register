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
      registrationRequirements: undefined,
      registrationUrl: undefined,
      industries: undefined,
      qualification: undefined,
      legislations: undefined,
      reservedActivities: undefined,
      protectedTitles: undefined,
      regulationUrl: undefined,
      profession: undefined,
      user: undefined,
      keywords: undefined,
      socCode: undefined,
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
  registrationRequirements: 'Some Requirements',
  registrationUrl: 'http://example.com/required',
  industries: [
    industryFactory.build({ name: 'Example industry', id: 'example-industry' }),
  ],
  qualification: qualificationFactory.build(),
  legislations: legislationFactory.buildList(1),
  regulationSummary: 'Example summary',
  reservedActivities: 'Example activities',
  protectedTitles: 'Example titles',
  regulationUrl: 'http://example.com/regulations',
  profession: professionFactory.build(),
  user: userFactory.build(),
  status: ProfessionVersionStatus.Unconfirmed,
  keywords: 'foo,bar,baz',
  socCode: 1234,
  created_at: new Date(),
  updated_at: new Date(),
}));

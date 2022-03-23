import { Factory } from 'fishery';
import { Profession } from '../../professions/profession.entity';
import { RegulationType } from '../../professions/profession-version.entity';
import industryFactory from './industry';
import organisationFactory from './organisation';
import qualificationFactory from './qualification';
import userFactory from './user';

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
      registrationRequirements: undefined,
      registrationUrl: undefined,
      industries: undefined,
      qualification: undefined,
      legislations: undefined,
      organisation: undefined,
      additionalOrganisation: undefined,
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
  regulationType: RegulationType.Licensing,
  registrationRequirements: 'Some Requirements',
  registrationUrl: 'http://example.com/required',
  industries: [
    industryFactory.build({ name: 'Example industry', id: 'example-industry' }),
  ],
  qualification: qualificationFactory.build(),
  confirmed: false,
  created_at: new Date(),
  legislations: [],
  organisation: organisationFactory.build({ name: 'Example organisation' }),
  professionToOrganisations: undefined,
  additionalOrganisation: undefined,
  regulationSummary: 'Example summary',
  reservedActivities: 'Example activities',
  protectedTitles: 'Example titles',
  regulationUrl: 'http://example.com/regulations',
  versions: [],
  changedByUser: userFactory.build(),
  lastModified: new Date(),
  updated_at: new Date(),
  versionId: 'version-id',
}));

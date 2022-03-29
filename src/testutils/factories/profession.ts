import { Factory } from 'fishery';
import { Profession } from '../../professions/profession.entity';
import { Organisation } from '../../organisations/organisation.entity';

import { RegulationType } from '../../professions/profession-version.entity';
import { ProfessionToOrganisation } from '../../professions/profession-to-organisation.entity';

import industryFactory from './industry';
import organisationFactory from './organisation';
import qualificationFactory from './qualification';
import userFactory from './user';

type ProfessionTransientParams = {
  organisations: Organisation[];
};

class ProfessionFactory extends Factory<Profession, ProfessionTransientParams> {
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

export default ProfessionFactory.define(({ transientParams, sequence }) => {
  const { organisations } = transientParams;

  const professionToOrganisations = (
    organisations || [
      organisationFactory.build({ name: 'Example organisation' }),
    ]
  ).map((organisation) => {
    return {
      organisation: organisation,
    } as ProfessionToOrganisation;
  });

  const profession = {
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
      industryFactory.build({
        name: 'Example industry',
        id: 'example-industry',
      }),
    ],
    qualification: qualificationFactory.build(),
    confirmed: false,
    created_at: new Date(),
    legislations: [],
    organisation: organisationFactory.build({ name: 'Example organisation' }),
    professionToOrganisations: professionToOrganisations,
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
  };

  return profession;
});

import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from '../profession-to-organisation.entity';
import { sortOrganisationsByRole } from './sort-organisations-by-role';

describe('sortOrganisationsByRole', () => {
  it("should sort a profession's organisations by role", () => {
    const organisation1 = organisationFactory.build({});
    const organisation2 = organisationFactory.build({});
    const organisation3 = organisationFactory.build({});

    const profession = professionFactory.build({
      name: 'Example Profession',
      professionToOrganisations: [
        {
          organisation: organisation1,
          role: OrganisationRole.AwardingBody,
        },
        {
          organisation: organisation2,
          role: OrganisationRole.PrimaryRegulator,
        },
        {
          organisation: organisation3,
          role: OrganisationRole.CharteredBody,
        },
      ] as ProfessionToOrganisation[],
    });

    expect(sortOrganisationsByRole(profession)).toEqual([
      {
        organisation: organisation2,
        role: OrganisationRole.PrimaryRegulator,
      },
      {
        organisation: organisation3,
        role: OrganisationRole.CharteredBody,
      },
      {
        organisation: organisation1,
        role: OrganisationRole.AwardingBody,
      },
    ]);
  });
});

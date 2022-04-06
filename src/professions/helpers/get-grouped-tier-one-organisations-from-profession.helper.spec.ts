import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { getGroupedTierOneOrganisationsFromProfession } from './get-grouped-tier-one-organisations-from-profession.helper';
import {
  OrganisationRole,
  ProfessionToOrganisation,
} from '../profession-to-organisation.entity';

describe('getGroupedTierOneOrganisationsFromProfession', () => {
  it('should group all tier one organisations by their role', () => {
    const organisation1 = organisationFactory.build();
    const organisation2 = organisationFactory.build();
    const organisation3 = organisationFactory.build();
    const organisation4 = organisationFactory.build();
    const organisation5 = organisationFactory.build();

    const profession = professionFactory.build({
      professionToOrganisations: [
        {
          organisation: organisation1,
          role: OrganisationRole.PrimaryRegulator,
        },
        {
          organisation: organisation2,
          role: OrganisationRole.CharteredBody,
        },
        {
          organisation: organisation3,
          role: OrganisationRole.CharteredBody,
        },
        {
          organisation: organisation4,
          role: OrganisationRole.OversightBody,
        },
        {
          organisation: organisation5,
          role: OrganisationRole.AwardingBody,
        },
      ] as ProfessionToOrganisation[],
    });

    expect(getGroupedTierOneOrganisationsFromProfession(profession)).toEqual({
      primaryRegulator: [organisation1],
      charteredBody: [organisation2, organisation3],
      oversightBody: [organisation4],
    });
  });

  it('should return an empty list when there are no organisations', () => {
    const profession = professionFactory.build({
      professionToOrganisations: [],
    });

    expect(getGroupedTierOneOrganisationsFromProfession(profession)).toEqual(
      {},
    );
  });

  it('should return an empty list when therer are no tier one organisations', () => {
    const profession = professionFactory.build({
      professionToOrganisations: [
        {
          organisation: organisationFactory.build(),
          role: OrganisationRole.AwardingBody,
        },
      ] as ProfessionToOrganisation[],
    });

    expect(getGroupedTierOneOrganisationsFromProfession(profession)).toEqual(
      {},
    );
  });
});

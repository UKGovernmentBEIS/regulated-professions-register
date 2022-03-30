import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { getTierOneOrganisationsFromProfession } from './get-tier-one-organisations-from-profession.helper';
import {
  OrganisationRole,
  ProfessionToOrganisation,
} from '../profession-to-organisation.entity';

describe('getTierOneOrganisationsFromProfession', () => {
  describe('when the Profession has one tier-one organisation', () => {
    it('returns a single-element array containing only that organisation', () => {
      const organisation = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          {
            organisation: organisation,
            role: OrganisationRole.PrimaryRegulator,
          },
        ] as ProfessionToOrganisation[],
      });

      expect(getTierOneOrganisationsFromProfession(profession)).toEqual([
        organisation,
      ]);
    });
  });

  describe('when the Profession has one tier-two organisation', () => {
    it('returns an empty array', () => {
      const organisation = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          {
            organisation: organisation,
            role: OrganisationRole.EnforcementBody,
          },
        ] as ProfessionToOrganisation[],
      });

      expect(getTierOneOrganisationsFromProfession(profession)).toEqual([]);
    });
  });

  describe('when the Profession has a mix of tier-one and tier-two organisations', () => {
    it('returns only the tier-one organisations', () => {
      const organisation = organisationFactory.build();
      const additionalOrganisation = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          { organisation: organisation, role: OrganisationRole.QualifyingBody },
          {
            organisation: additionalOrganisation,
            role: OrganisationRole.AwardingBody,
          },
        ] as ProfessionToOrganisation[],
      });

      expect(getTierOneOrganisationsFromProfession(profession)).toEqual([
        organisation,
      ]);
    });
  });

  describe('when an organisation is null', () => {
    it('filters any null items out', () => {
      const organisation = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          {
            organisation: organisation,
            role: OrganisationRole.PrimaryRegulator,
          },
          { organisation: null },
        ] as ProfessionToOrganisation[],
      });

      expect(getTierOneOrganisationsFromProfession(profession)).toEqual([
        organisation,
      ]);
    });
  });
});

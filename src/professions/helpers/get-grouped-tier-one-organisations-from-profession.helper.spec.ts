import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { getGroupedTierOneOrganisationsFromProfession } from './get-grouped-tier-one-organisations-from-profession.helper';
import {
  OrganisationRole,
  ProfessionToOrganisation,
} from '../profession-to-organisation.entity';
import { Organisation } from '../../organisations/organisation.entity';

jest.mock('../../organisations/organisation.entity');

describe('getGroupedTierOneOrganisationsFromProfession', () => {
  describe('when fetching the latest version', () => {
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

      (Organisation.withLatestVersion as jest.Mock).mockImplementation(
        (organisation) => organisation,
      );

      expect(
        getGroupedTierOneOrganisationsFromProfession(
          profession,
          'latestVersion',
        ),
      ).toEqual({
        primaryRegulator: [organisation1],
        charteredBody: [organisation2, organisation3],
        oversightBody: [organisation4],
      });

      expect(Organisation.withLatestVersion).toHaveBeenCalledWith(
        organisation1,
      );
      expect(Organisation.withLatestVersion).toHaveBeenCalledWith(
        organisation2,
      );
      expect(Organisation.withLatestVersion).toHaveBeenCalledWith(
        organisation3,
      );
      expect(Organisation.withLatestVersion).toHaveBeenCalledWith(
        organisation4,
      );
    });
  });

  describe('when fetching the latest live version', () => {
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

      (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
        (organisation) => organisation,
      );

      expect(
        getGroupedTierOneOrganisationsFromProfession(
          profession,
          'latestLiveVersion',
        ),
      ).toEqual({
        primaryRegulator: [organisation1],
        charteredBody: [organisation2, organisation3],
        oversightBody: [organisation4],
      });

      expect(Organisation.withLatestLiveVersion).toHaveBeenCalledWith(
        organisation1,
      );
      expect(Organisation.withLatestLiveVersion).toHaveBeenCalledWith(
        organisation2,
      );
      expect(Organisation.withLatestLiveVersion).toHaveBeenCalledWith(
        organisation3,
      );
      expect(Organisation.withLatestLiveVersion).toHaveBeenCalledWith(
        organisation4,
      );
    });

    it('should filter out any organisations that do not have a live version', () => {
      const organisation1 = organisationFactory.build();
      const organisation2 = organisationFactory.build();
      const organisation3 = organisationFactory.build();

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
        ] as ProfessionToOrganisation[],
      });

      (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
        (organisation) =>
          organisation.id === organisation3.id ? undefined : organisation,
      );

      expect(
        getGroupedTierOneOrganisationsFromProfession(
          profession,
          'latestLiveVersion',
        ),
      ).toEqual({
        primaryRegulator: [organisation1],
        charteredBody: [organisation2],
      });
    });
  });

  it('should return an empty list when there are no organisations', () => {
    const profession = professionFactory.build({
      professionToOrganisations: [],
    });

    expect(
      getGroupedTierOneOrganisationsFromProfession(profession, 'latestVersion'),
    ).toEqual({});
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

    expect(
      getGroupedTierOneOrganisationsFromProfession(profession, 'latestVersion'),
    ).toEqual({});
  });
});

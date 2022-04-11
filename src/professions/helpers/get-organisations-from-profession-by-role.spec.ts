import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { getOrganisationsFromProfessionByRole } from './get-organisations-from-profession-by-role';
import {
  OrganisationRole,
  ProfessionToOrganisation,
} from '../profession-to-organisation.entity';
import { Organisation } from '../../organisations/organisation.entity';

jest.mock('../../organisations/organisation.entity');

describe('getOrganisationsFromProfessionByRole', () => {
  describe('when the Profession has one organisation matching that query', () => {
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

      (Organisation.withLatestVersion as jest.Mock).mockImplementation(
        (organisation) => organisation,
      );

      expect(
        getOrganisationsFromProfessionByRole(
          profession,
          OrganisationRole.PrimaryRegulator,
          'latestVersion',
        ),
      ).toEqual([organisation]);

      expect(Organisation.withLatestVersion).toHaveBeenCalledWith(organisation);
    });
  });

  describe('when I request the latest live version', () => {
    it('builds organisations matching my query with their latest live version', () => {
      const organisation = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          {
            organisation: organisation,
            role: OrganisationRole.PrimaryRegulator,
          },
        ] as ProfessionToOrganisation[],
      });

      getOrganisationsFromProfessionByRole(
        profession,
        OrganisationRole.PrimaryRegulator,
        'latestLiveVersion',
      );

      expect(Organisation.withLatestLiveVersion).toHaveBeenCalledWith(
        organisation,
      );
    });
  });

  describe('when the Profession has a mixture of organisations', () => {
    it('returns a single-element array containing only that organisation', () => {
      const organisation1 = organisationFactory.build();
      const organisation2 = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          {
            organisation: organisation1,
            role: OrganisationRole.PrimaryRegulator,
          },
          {
            organisation: organisation2,
            role: OrganisationRole.AdditionalRegulator,
          },
        ] as ProfessionToOrganisation[],
      });

      (Organisation.withLatestVersion as jest.Mock).mockImplementation(
        (organisation) => organisation,
      );

      expect(
        getOrganisationsFromProfessionByRole(
          profession,
          OrganisationRole.PrimaryRegulator,
          'latestVersion',
        ),
      ).toEqual([organisation1]);

      expect(Organisation.withLatestVersion).toHaveBeenCalledWith(
        organisation1,
      );
    });
  });

  describe('when the profession has some organisations without versions', () => {
    it('should filter out those organisations', () => {
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
            role: OrganisationRole.AdditionalRegulator,
          },
          {
            organisation: organisation3,
            role: OrganisationRole.AdditionalRegulator,
          },
        ] as ProfessionToOrganisation[],
      });

      (Organisation.withLatestVersion as jest.Mock).mockImplementation(
        (organisation) =>
          organisation.id === organisation3.id ? undefined : organisation,
      );

      expect(
        getOrganisationsFromProfessionByRole(
          profession,
          OrganisationRole.AdditionalRegulator,
          'latestVersion',
        ),
      ).toEqual([organisation2]);

      expect(Organisation.withLatestVersion).toHaveBeenCalledWith(
        organisation2,
      );
      expect(Organisation.withLatestVersion).toHaveBeenCalledWith(
        organisation3,
      );
    });
  });
});

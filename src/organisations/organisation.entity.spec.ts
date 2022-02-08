import { Organisation } from './organisation.entity';
import { OrganisationVersionStatus } from './organisation-version.entity';

import organisationFactory from '../testutils/factories/organisation';
import organisationVersionFactory from '../testutils/factories/organisation-version';
import professionFactory from '../testutils/factories/profession';
import { Profession } from '../professions/profession.entity';

jest.mock('../professions/profession.entity');

describe('Organisation', () => {
  describe('withVersion', () => {
    it('should return an entity with a version', () => {
      const profession = professionFactory.build();
      const organisationVersion = organisationVersionFactory.build();
      const organisation = organisationFactory.build({
        versions: [organisationVersion, organisationVersionFactory.build()],
        professions: [profession],
      });

      (Profession.withLatestLiveOrDraftVersion as jest.Mock).mockImplementation(
        () => profession,
      );

      const result = Organisation.withVersion(
        organisation,
        organisationVersion,
      );

      expect(result).toEqual({
        ...organisation,
        alternateName: organisationVersion.alternateName,
        address: organisationVersion.address,
        url: organisationVersion.url,
        email: organisationVersion.email,
        contactUrl: organisationVersion.contactUrl,
        telephone: organisationVersion.telephone,
        fax: organisationVersion.fax,
        versionId: organisationVersion.id,
        status: organisationVersion.status,
        professions: [profession],
      });
    });

    describe('when there are no Live or Draft Professions', () => {
      it('sets the professions field to an empty array', () => {
        const profession = professionFactory.build();

        const organisationVersion = organisationVersionFactory.build();
        const organisation = organisationFactory.build({
          versions: [organisationVersion, organisationVersionFactory.build()],
          professions: [profession],
        });

        (
          Profession.withLatestLiveOrDraftVersion as jest.Mock
        ).mockImplementation(() => null);

        const result = Organisation.withVersion(
          organisation,
          organisationVersion,
        );

        expect(result).toEqual({
          ...organisation,
          alternateName: organisationVersion.alternateName,
          address: organisationVersion.address,
          url: organisationVersion.url,
          email: organisationVersion.email,
          contactUrl: organisationVersion.contactUrl,
          telephone: organisationVersion.telephone,
          fax: organisationVersion.fax,
          versionId: organisationVersion.id,
          status: organisationVersion.status,
          professions: [],
        });
      });
    });
  });

  describe('withLatestLiveVersion', () => {
    it('should get the latest live version', () => {
      const organisationVersion = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Live,
        updated_at: new Date(2022, 1, 2),
      });
      const organisation = organisationFactory.build({
        versions: [
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Draft,
            updated_at: new Date(2022, 1, 1),
          }),
          organisationVersion,
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Live,
            updated_at: new Date(2022, 1, 3),
          }),
        ],
      });

      expect(Organisation.withLatestLiveVersion(organisation)).toEqual(
        Organisation.withVersion(organisation, organisationVersion),
      );
    });
  });
});

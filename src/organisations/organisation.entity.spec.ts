import { Organisation } from './organisation.entity';
import { OrganisationVersionStatus } from './organisation-version.entity';

import organisationFactory from '../testutils/factories/organisation';
import organisationVersionFactory from '../testutils/factories/organisation-version';

describe('Organisation', () => {
  describe('withVersion', () => {
    it('should return an entity with a version', () => {
      const organisationVersion = organisationVersionFactory.build();
      const organisation = organisationFactory.build({
        versions: [organisationVersion, organisationVersionFactory.build()],
      });

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
        telephone: organisationVersion.telephone,
        versionId: organisationVersion.id,
        status: organisationVersion.status,
        changedByUser: organisationVersion.user,
        lastModified: organisationVersion.updated_at,
      });
    });
  });

  describe('withLatestLiveVersion', () => {
    it('should get the latest live version', () => {
      const organisationVersion = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Live,
        updated_at: new Date(2022, 1, 3),
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
            updated_at: new Date(2022, 1, 2),
          }),
        ],
      });

      expect(Organisation.withLatestLiveVersion(organisation)).toEqual(
        Organisation.withVersion(organisation, organisationVersion),
      );
    });
  });

  describe('withLatestVersion', () => {
    it('should get the latest version', () => {
      const organisationVersion = organisationVersionFactory.build({
        updated_at: new Date(2022, 1, 3),
      });
      const organisation = organisationFactory.build({
        versions: [
          organisationVersionFactory.build({
            updated_at: new Date(2022, 1, 1),
          }),
          organisationVersion,
          organisationVersionFactory.build({
            updated_at: new Date(2022, 1, 2),
          }),
        ],
      });

      expect(Organisation.withLatestVersion(organisation)).toEqual(
        Organisation.withVersion(organisation, organisationVersion),
      );
    });
  });
});

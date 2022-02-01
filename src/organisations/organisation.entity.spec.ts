import { Organisation } from './organisation.entity';

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
        contactUrl: organisationVersion.contactUrl,
        telephone: organisationVersion.telephone,
        fax: organisationVersion.fax,
        versionId: organisationVersion.id,
        status: organisationVersion.status,
      });
    });
  });
});

import professionFactory from '../testutils/factories/profession';
import professionVersionFactory from '../testutils/factories/profession-version';
import { Profession } from './profession.entity';

describe('Profession', () => {
  describe('withVersion', () => {
    it('should return an entity with a version', () => {
      const professionVersion = professionVersionFactory.build();
      const profession = professionFactory.build({
        versions: [professionVersion, professionVersionFactory.build()],
      });

      const result = Profession.withVersion(profession, professionVersion);

      expect(result).toEqual({
        ...profession,
        alternateName: professionVersion.alternateName,
        description: professionVersion.description,
        occupationLocations: professionVersion.occupationLocations,
        regulationType: professionVersion.regulationType,
        mandatoryRegistration: professionVersion.mandatoryRegistration,
        industries: professionVersion.industries,
        qualification: professionVersion.qualification,
        reservedActivities: professionVersion.reservedActivities,
        legislations: professionVersion.legislations,
        organisation: professionVersion.organisation,
        status: professionVersion.status,
        versionId: professionVersion.id,
      });
    });
  });
});

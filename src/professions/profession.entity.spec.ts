import professionFactory from '../testutils/factories/profession';
import professionVersionFactory from '../testutils/factories/profession-version';
import { ProfessionVersionStatus } from './profession-version.entity';
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
        status: professionVersion.status,
        versionId: professionVersion.id,
      });
    });
  });

  describe('withLatestLiveVersion', () => {
    it('should get the latest live version', () => {
      const professionVersion = professionVersionFactory.build({
        status: ProfessionVersionStatus.Live,
        updated_at: new Date(2022, 1, 3),
      });
      const profession = professionFactory.build({
        versions: [
          professionVersionFactory.build({
            status: ProfessionVersionStatus.Draft,
            updated_at: new Date(2022, 1, 1),
          }),
          professionVersion,
          professionVersionFactory.build({
            status: ProfessionVersionStatus.Live,
            updated_at: new Date(2022, 1, 2),
          }),
        ],
      });

      expect(Profession.withLatestLiveVersion(profession)).toEqual(
        Profession.withVersion(profession, professionVersion),
      );
    });

    describe('when there is no Live version', () => {
      it('returns null', () => {
        const profession = professionFactory.build({
          versions: [
            professionVersionFactory.build({
              status: ProfessionVersionStatus.Draft,
            }),
            professionVersionFactory.build({
              status: ProfessionVersionStatus.Draft,
            }),
          ],
        });

        expect(Profession.withLatestLiveVersion(profession)).toEqual(null);
      });
    });
  });

  describe('withLatestLiveOrDraftVersion', () => {
    it('should get the latest live or draft version', () => {
      const professionVersion = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
        updated_at: new Date(2022, 1, 3),
      });
      const profession = professionFactory.build({
        versions: [
          professionVersionFactory.build({
            status: ProfessionVersionStatus.Live,
            updated_at: new Date(2022, 1, 1),
          }),
          professionVersion,
          professionVersionFactory.build({
            status: ProfessionVersionStatus.Draft,
            updated_at: new Date(2022, 1, 2),
          }),
        ],
      });

      expect(Profession.withLatestLiveOrDraftVersion(profession)).toEqual(
        Profession.withVersion(profession, professionVersion),
      );
    });

    describe('when there are no Live or Draft versions', () => {
      it('returns null', () => {
        const profession = professionFactory.build({
          versions: [
            professionVersionFactory.build({
              status: ProfessionVersionStatus.Unconfirmed,
            }),
            professionVersionFactory.build({
              status: ProfessionVersionStatus.Unconfirmed,
            }),
          ],
        });

        expect(Profession.withLatestLiveOrDraftVersion(profession)).toEqual(
          null,
        );
      });
    });
  });
});

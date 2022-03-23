import { Legislation } from '../../legislations/legislation.entity';
import { OrganisationVersionStatus } from '../../organisations/organisation-version.entity';
import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import {
  getPublicationBlockers,
  PublicationBlocker,
} from './get-publication-blockers.helper';

describe('getPublicationBlockers', () => {
  describe('when given a just created ProfessionVersion', () => {
    it('returns all publish blockers', () => {
      const version = professionVersionFactory.justCreated('version-id').build({
        profession: professionFactory.build(),
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'scope',
        },
        {
          type: 'incomplete-section',
          section: 'regulatedActivities',
        },
        {
          type: 'incomplete-section',
          section: 'qualifications',
        },
        {
          type: 'incomplete-section',
          section: 'legislation',
        },
        {
          type: 'organisation-not-live',
          organisation: version.profession.organisation,
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a complete ProfessionVersion with a live Organisation', () => {
    it('returns an empty array', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
      });

      expect(getPublicationBlockers(version)).toEqual([]);
    });
  });

  describe('when given a ProfessionVersion with empty industries', () => {
    it('returns the "scope" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        industries: [],
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'scope',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with empty nations', () => {
    it('returns the "scope" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        occupationLocations: [],
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'scope',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an empty regulations summary', () => {
    it('returns the "regulatedActivities" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        description: '',
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'regulatedActivities',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an undefined regulation type', () => {
    it('returns the "regulatedActivities" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        regulationType: undefined,
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'regulatedActivities',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an empty reserved activities', () => {
    it('returns the "regulatedActivities" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        reservedActivities: '',
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'regulatedActivities',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an undefined qualification', () => {
    it('returns the "qualifications" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        qualification: undefined,
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'qualifications',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an empty qualification route', () => {
    it('returns the "qualifications" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        qualification: { routesToObtain: '' },
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'qualifications',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an undefined legislations', () => {
    it('returns the "legislation" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        legislations: undefined,
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'legislation',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an empty legislation name', () => {
    it('returns the "legislation" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
        }),
        legislations: [new Legislation()],
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'incomplete-section',
          section: 'legislation',
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an no live Organisation', () => {
    it('returns the "organisation-not-live" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Draft,
              }),
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Archived,
              }),
            ],
          }),
        }),
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'organisation-not-live',
          organisation: version.profession.organisation,
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an additional Organisation with no live versions', () => {
    it('returns the "organisation-not-live" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Live,
              }),
            ],
          }),
          additionalOrganisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Draft,
              }),
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Archived,
              }),
            ],
          }),
        }),
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'organisation-not-live',
          organisation: version.profession.additionalOrganisation,
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with an Organisation and an additional Organisation that both have no live versions', () => {
    it('returns two "organisation-not-live" publish blockers', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build({
          organisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Draft,
              }),
            ],
          }),
          additionalOrganisation: organisationFactory.build({
            versions: [
              organisationVersionFactory.build({
                status: OrganisationVersionStatus.Archived,
              }),
            ],
          }),
        }),
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'organisation-not-live',
          organisation: version.profession.organisation,
        },
        {
          type: 'organisation-not-live',
          organisation: version.profession.additionalOrganisation,
        },
      ] as PublicationBlocker[]);
    });
  });
});

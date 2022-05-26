import { Legislation } from '../../legislations/legislation.entity';
import { Organisation } from '../../organisations/organisation.entity';
import { OrganisationVersionStatus } from '../../organisations/organisation-version.entity';
import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import {
  getPublicationBlockers,
  PublicationBlocker,
} from './get-publication-blockers.helper';

const buildProfession = (params: any, organisations: Organisation[]) => {
  const profession = professionFactory.build(
    {},
    {
      transient: {
        organisations: organisations,
      },
    },
  );

  return professionVersionFactory.build({
    ...params,
    profession: profession,
  });
};

const buildProfessionWithLiveOrganisation = (params: any = {}) => {
  return buildProfession(params, [
    organisationFactory.build({
      versions: [
        organisationVersionFactory.build({
          status: OrganisationVersionStatus.Live,
        }),
      ],
    }),
  ]);
};

describe('getPublicationBlockers', () => {
  describe('when given a just created ProfessionVersion', () => {
    it('returns all publish blockers', () => {
      const organisation = organisationFactory.build();
      const version = professionVersionFactory.justCreated('version-id').build({
        profession: professionFactory.build(
          {},
          {
            transient: {
              organisations: [organisation],
            },
          },
        ),
      });

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'organisation-not-live',
          organisation: organisation,
        },
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
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a complete ProfessionVersion with a live Organisation', () => {
    it('returns an empty array', () => {
      const version = buildProfessionWithLiveOrganisation();

      expect(getPublicationBlockers(version)).toEqual([]);
    });
  });

  describe('when given a ProfessionVersion with empty industries', () => {
    it('returns the "scope" publish blocker', () => {
      const version = buildProfessionWithLiveOrganisation({ industries: [] });

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
      const version = buildProfessionWithLiveOrganisation({
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
      const version = buildProfessionWithLiveOrganisation({
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
      const version = buildProfessionWithLiveOrganisation({
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
      const version = buildProfessionWithLiveOrganisation({
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
      const version = buildProfessionWithLiveOrganisation({
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
      const version = buildProfessionWithLiveOrganisation({
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

  describe('when given a ProfessionVersion with a qualification without other countries routes to recognition', () => {
    it('returns the "qualifications" publish blocker', () => {
      const version = professionVersionFactory.build({
        profession: professionFactory.build(
          {},
          {
            transient: {
              organisations: [
                organisationFactory.build({
                  versions: [
                    organisationVersionFactory.build({
                      status: OrganisationVersionStatus.Live,
                    }),
                  ],
                }),
              ],
            },
          },
        ),
        qualification: {
          otherCountriesRecognitionRoutes: null,
        },
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
      const version = buildProfessionWithLiveOrganisation({
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
      const version = buildProfessionWithLiveOrganisation({
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
      const organisation = organisationFactory.build({
        versions: [
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Draft,
          }),
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Archived,
          }),
        ],
      });
      const version = buildProfession({}, [organisation]);

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'organisation-not-live',
          organisation: organisation,
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with one live and one non-live Organisation', () => {
    it('returns the "organisation-not-live" publish blocker', () => {
      const liveOrganisation = organisationFactory.build({
        versions: [
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Live,
          }),
        ],
      });

      const draftOrganisation = organisationFactory.build({
        versions: [
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Draft,
          }),
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Archived,
          }),
        ],
      });

      const version = buildProfession({}, [
        liveOrganisation,
        draftOrganisation,
      ]);

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'organisation-not-live',
          organisation: draftOrganisation,
        },
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a ProfessionVersion with two non-live organisations', () => {
    it('returns two "organisation-not-live" publish blockers', () => {
      const organisation1 = organisationFactory.build({
        versions: [
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Draft,
          }),
        ],
      });

      const organisation2 = organisationFactory.build({
        versions: [
          organisationVersionFactory.build({
            status: OrganisationVersionStatus.Archived,
          }),
        ],
      });

      const version = buildProfession({}, [organisation1, organisation2]);

      expect(getPublicationBlockers(version)).toEqual([
        {
          type: 'organisation-not-live',
          organisation: organisation1,
        },
        {
          type: 'organisation-not-live',
          organisation: organisation2,
        },
      ] as PublicationBlocker[]);
    });
  });
});

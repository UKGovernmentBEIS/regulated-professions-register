import { Legislation } from '../../legislations/legislation.entity';
import professionVersionFactory from '../../testutils/factories/profession-version';
import {
  getPublicationBlockers,
  PublicationBlocker,
} from './get-publication-blockers.helper';

describe('getPublicationBlockers', () => {
  describe('when given a just created ProfessionVersion', () => {
    it('returns all publish blockers', () => {
      const version = professionVersionFactory
        .justCreated('version-id')
        .build();

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
      ] as PublicationBlocker[]);
    });
  });

  describe('when given a complete ProfessionVersion', () => {
    it('returns an empty array', () => {
      const version = professionVersionFactory.build();

      expect(getPublicationBlockers(version)).toEqual([]);
    });
  });

  describe('when given a ProfessionVersion with empty industries', () => {
    it('returns the "scope" publish blocked', () => {
      const version = professionVersionFactory.build({
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
    it('returns the "scope" publish blocked', () => {
      const version = professionVersionFactory.build({
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
    it('returns the "regulatedActivities" publish blocked', () => {
      const version = professionVersionFactory.build({
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
    it('returns the "regulatedActivities" publish blocked', () => {
      const version = professionVersionFactory.build({
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
    it('returns the "regulatedActivities" publish blocked', () => {
      const version = professionVersionFactory.build({
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
    it('returns the "qualifications" publish blocked', () => {
      const version = professionVersionFactory.build({
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
    it('returns the "qualifications" publish blocked', () => {
      const version = professionVersionFactory.build({
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
    it('returns the "legislation" publish blocked', () => {
      const version = professionVersionFactory.build({
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
    it('returns the "legislation" publish blocked', () => {
      const version = professionVersionFactory.build({
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
});

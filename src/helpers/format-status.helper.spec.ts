import { OrganisationVersionStatus } from '../organisations/organisation-version.entity';
import { ProfessionVersionStatus } from '../professions/profession-version.entity';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { translationOf } from '../testutils/translation-of';
import { formatStatus } from './format-status.helper';

describe('formatStatus', () => {
  describe('when given `null`', () => {
    it('returns an empty string', () => {
      const i18nService = createMockI18nService();

      const result = formatStatus(null, i18nService);

      expect(result).toEqual('');
    });
  });

  describe('when given an unrecognised status', () => {
    it('returns an empty string', () => {
      const i18nService = createMockI18nService();

      const result = formatStatus(
        'not a status' as ProfessionVersionStatus,
        i18nService,
      );

      expect(result).toEqual('');
    });
  });

  describe('when given a "unconfirmed" status', () => {
    it('returns an empty string', () => {
      const i18nService = createMockI18nService();

      const result = formatStatus(
        OrganisationVersionStatus.Unconfirmed,
        i18nService,
      );

      expect(result).toEqual('');
    });
  });

  describe('when given a "archived" status', () => {
    it('returns a grey tag', () => {
      const i18nService = createMockI18nService();

      const result = formatStatus(
        ProfessionVersionStatus.Archived,
        i18nService,
      );

      expect(result).toEqual(
        `<strong class="govuk-tag govuk-tag--grey">${translationOf(
          'app.status.archived',
        )}</strong>`,
      );
    });
  });

  describe('when given a "draft" status', () => {
    it('returns a yellow tag', () => {
      const i18nService = createMockI18nService();

      const result = formatStatus(OrganisationVersionStatus.Draft, i18nService);

      expect(result).toEqual(
        `<strong class="govuk-tag govuk-tag--yellow">${translationOf(
          'app.status.draft',
        )}</strong>`,
      );
    });
  });

  describe('when given a "live" status', () => {
    it('returns a turquoise tag', () => {
      const i18nService = createMockI18nService();

      const result = formatStatus(ProfessionVersionStatus.Live, i18nService);

      expect(result).toEqual(
        `<strong class="govuk-tag govuk-tag--turquoise">${translationOf(
          'app.status.live',
        )}</strong>`,
      );
    });
  });
});

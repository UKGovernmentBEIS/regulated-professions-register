import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { Nation } from '../nation';
import { NationsListPresenter } from './nations-list.presenter';

describe('NationsListPresenter', () => {
  describe('textList', () => {
    it('outputs an empty string when given an empty list of nations', () => {
      const i18nService = createMockI18nService();
      const nationsListPresenter = new NationsListPresenter([], i18nService);

      expect(nationsListPresenter.textList()).toEqual('');
    });

    it('translates a single nation', () => {
      const i18nService = createMockI18nService();
      const nationsListPresenter = new NationsListPresenter(
        [Nation.find('GB-SCT')],
        i18nService,
      );

      expect(nationsListPresenter.textList()).toEqual(
        translationOf('nations.scotland'),
      );

      expect(i18nService.translate).toHaveBeenCalledWith('nations.scotland');
    });

    it('concatenates multiple nations into a comma separated list', () => {
      const i18nService = createMockI18nService();
      const nationsListPresenter = new NationsListPresenter(
        [Nation.find('GB-ENG'), Nation.find('GB-WLS')],
        i18nService,
      );

      expect(nationsListPresenter.textList()).toEqual(
        `${translationOf('nations.england')}, ${translationOf(
          'nations.wales',
        )}`,
      );

      expect(i18nService.translate).toHaveBeenCalledWith('nations.england');
      expect(i18nService.translate).toHaveBeenCalledWith('nations.wales');
    });

    it('collapses multiple nations to "United Kingdom"', () => {
      const i18nService = createMockI18nService();
      const nationsListPresenter = new NationsListPresenter(
        Nation.all(),
        i18nService,
      );

      expect(nationsListPresenter.textList()).toEqual(
        translationOf('app.unitedKingdom'),
      );

      expect(i18nService.translate).toHaveBeenCalledWith('app.unitedKingdom');
      expect(i18nService.translate).not.toHaveBeenCalledWith('nations.england');
    });
  });

  describe('htmlList', () => {
    it('outputs an empty string when given an empty list of nations', () => {
      const i18nService = createMockI18nService();
      const nationsListPresenter = new NationsListPresenter([], i18nService);

      expect(nationsListPresenter.htmlList()).toEqual('');
    });

    it('translates a single nation', () => {
      const i18nService = createMockI18nService();
      const nationsListPresenter = new NationsListPresenter(
        [Nation.find('GB-SCT')],
        i18nService,
      );

      expect(nationsListPresenter.htmlList()).toEqual(
        `<ul class="govuk-list"><li>${translationOf(
          'nations.scotland',
        )}</li></ul>`,
      );

      expect(i18nService.translate).toHaveBeenCalledWith('nations.scotland');
    });

    it('concatenates multiple nations a HTML list', () => {
      const i18nService = createMockI18nService();
      const nationsListPresenter = new NationsListPresenter(
        [Nation.find('GB-ENG'), Nation.find('GB-WLS')],
        i18nService,
      );

      expect(nationsListPresenter.htmlList()).toEqual(
        `<ul class="govuk-list"><li>${translationOf(
          'nations.england',
        )}</li><li>${translationOf('nations.wales')}</li></ul>`,
      );

      expect(i18nService.translate).toHaveBeenCalledWith('nations.england');
      expect(i18nService.translate).toHaveBeenCalledWith('nations.wales');
    });

    it('collapses multiple nations to "United Kingdom"', () => {
      const i18nService = createMockI18nService();
      const nationsListPresenter = new NationsListPresenter(
        Nation.all(),
        i18nService,
      );

      expect(nationsListPresenter.htmlList()).toEqual(
        translationOf('app.unitedKingdom'),
      );

      expect(i18nService.translate).toHaveBeenCalledWith('app.unitedKingdom');
      expect(i18nService.translate).not.toHaveBeenCalledWith('nations.england');
    });
  });
});

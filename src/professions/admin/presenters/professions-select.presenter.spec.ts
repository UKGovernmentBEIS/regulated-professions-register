import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import professionFactory from '../../../testutils/factories/profession';
import { translationOf } from '../../../testutils/translation-of';
import { ProfessionsSelectPresenter } from './professions-select.presenter';

describe('ProfessionsSelectPresenter', () => {
  describe('selectArgs', () => {
    describe('when given a null selected profession', () => {
      it('returns a list of professions with no profession selected', () => {
        const profession1 = professionFactory.build({
          id: 'profession-id-1',
          name: 'Profession 1',
        });

        const profession2 = professionFactory.build({
          id: 'profession-id-2',
          name: 'Profession 2',
        });

        const profession3 = professionFactory.build({
          id: 'profession-id-3',
          name: 'Profession 3',
        });

        const expected: SelectItemArgs[] = [
          {
            text: translationOf('app.pleaseSelect'),
            value: '',
            selected: null,
          },
          {
            text: 'Profession 1',
            value: 'profession-id-1',
            selected: false,
          },
          {
            text: 'Profession 2',
            value: 'profession-id-2',
            selected: false,
          },
          {
            text: 'Profession 3',
            value: 'profession-id-3',
            selected: false,
          },
        ];

        const presenter = new ProfessionsSelectPresenter(
          [profession1, profession2, profession3],
          null,
          createMockI18nService(),
        );

        expect(presenter.selectArgs()).toEqual(expected);
      });
    });
    describe('when given a non-null selected profession', () => {
      it('returns a list of professions with the given profession selected', () => {
        const profession1 = professionFactory.build({
          id: 'profession-id-1',
          name: 'Profession 1',
        });

        const profession2 = professionFactory.build({
          id: 'profession-id-2',
          name: 'Profession 2',
        });

        const profession3 = professionFactory.build({
          id: 'profession-id-3',
          name: 'Profession 3',
        });

        const expected: SelectItemArgs[] = [
          {
            text: translationOf('app.pleaseSelect'),
            value: '',
            selected: null,
          },
          {
            text: 'Profession 1',
            value: 'profession-id-1',
            selected: false,
          },
          {
            text: 'Profession 2',
            value: 'profession-id-2',
            selected: false,
          },
          {
            text: 'Profession 3',
            value: 'profession-id-3',
            selected: true,
          },
        ];

        const presenter = new ProfessionsSelectPresenter(
          [profession1, profession2, profession3],
          profession3,
          createMockI18nService(),
        );

        expect(presenter.selectArgs()).toEqual(expected);
      });
    });
  });
});

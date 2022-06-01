import { isConfirmed } from '../../helpers/is-confirmed';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import professionFactory from '../../testutils/factories/profession';
import { translationOf } from '../../testutils/translation-of';
import ViewUtils from './viewUtils';

jest.mock('../../helpers/is-confirmed');

describe(ViewUtils, () => {
  const mockI18nService = createMockI18nService();
  describe('captionText', () => {
    describe('when passed a profession that has been confirmed', () => {
      it("returns the 'edit' text, including the Profession's name", () => {
        const profession = professionFactory.build();

        (isConfirmed as jest.Mock).mockReturnValue(true);

        expect(ViewUtils.captionText(mockI18nService, profession)).toEqual(
          translationOf('professions.form.captions.edit'),
        );
      });
    });

    describe('when passed a profession that has not yet been confirmed', () => {
      describe('when the profession has a name set', () => {
        it("returns the 'add' text with the Profession's name", () => {
          const profession = professionFactory.build({
            name: 'Example profession',
          });

          (isConfirmed as jest.Mock).mockReturnValue(false);

          expect(ViewUtils.captionText(mockI18nService, profession)).toEqual(
            translationOf('professions.form.captions.addWithName'),
          );
        });

        describe('when the profession has no name set', () => {
          it("returns the 'add' text", () => {
            const profession = professionFactory.build({
              name: null,
            });

            (isConfirmed as jest.Mock).mockReturnValue(false);

            expect(ViewUtils.captionText(mockI18nService, profession)).toEqual(
              translationOf('professions.form.captions.add'),
            );
          });
        });
      });
    });
  });
});

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
      it("returns the 'edit' text, including the Profession's name", async () => {
        const profession = professionFactory.build();

        (isConfirmed as jest.Mock).mockReturnValue(true);

        expect(
          await ViewUtils.captionText(mockI18nService, profession),
        ).toEqual(translationOf('professions.form.captions.edit'));
      });
    });

    describe('when passed a profession that has not yet been confirmed', () => {
      it("returns the 'add' text", async () => {
        const profession = professionFactory.build();

        (isConfirmed as jest.Mock).mockReturnValue(false);

        expect(
          await ViewUtils.captionText(mockI18nService, profession),
        ).toEqual(translationOf('professions.form.captions.add'));
      });
    });
  });
});

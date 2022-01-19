import ViewUtils from './viewUtils';

describe(ViewUtils, () => {
  describe('captionText', () => {
    describe('when passed a "true" editing value', () => {
      it('returns the "edit" text', () => {
        expect(ViewUtils.captionText(true)).toEqual(
          'professions.form.captions.edit',
        );
      });
    });

    describe('when passed a "false" editing value', () => {
      it('returns the "add" text', () => {
        expect(ViewUtils.captionText(false)).toEqual(
          'professions.form.captions.add',
        );
      });
    });
  });
});

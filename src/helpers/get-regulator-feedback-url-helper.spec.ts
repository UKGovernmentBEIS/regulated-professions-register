import { getRegulatorFeedbackUrl } from './get-regulator-feedback-url-helper';

describe('getRegulationFeedbackUrl', () => {
  describe('when the function is called', () => {
    it('returns the correct string', () => {
      process.env['REGULATOR_FEEDBACK_URL'] =
        'https://example.com/feedback-url';
      const url = getRegulatorFeedbackUrl();

      expect(url).toEqual(process.env['REGULATOR_FEEDBACK_URL']);
    });
  });
});

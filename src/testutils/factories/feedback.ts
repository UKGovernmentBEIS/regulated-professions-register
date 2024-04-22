import { Factory } from 'fishery';
import { Feedback } from '../../feedback/feedback.entity';

class FeedbackFactory extends Factory<Feedback> {
  technicalProblem(sequence) {
    return this.params({
      id: sequence.toString(),
      feedbackOrTechnical: "Yes, I'd like to report a technical problem",
      satisfaction: '',
      improvements: '',
      visitReason: '',
      visitReasonOther: '',
      contactAuthority: '',
      contactAuthorityNoReason: '',
      betaSurveyYesNo: '',
      betaSurveyEmail: '',
      problemArea: 'The whole site',
      problemAreaPage: '',
      problemDescription: 'Lorem ipsum',
      created_at: undefined,
    });
  }
}

export default FeedbackFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  feedbackOrTechnical: "No, I'd like to leave feedback about the service",
  satisfaction: 'Very satisfied',
  improvements: 'Lorem ipsum',
  visitReason: 'Get contact details for a regulatory authority',
  visitReasonOther: '',
  contactAuthority: 'Yes, I contacted them by phone or email',
  contactAuthorityNoReason: '',
  betaSurveyYesNo: 'No',
  betaSurveyEmail: '',
  problemArea: '',
  problemAreaPage: '',
  problemDescription: '',
  created_at: undefined,
  updated_at: new Date(),
}));

import { IsNotEmpty, MaxLength, ValidateIf } from 'class-validator';
import {
  MAX_MULTI_LINE_LENGTH,
  MAX_SINGLE_LINE_LENGTH,
} from '../../helpers/input-limits';

function isFeedback(e: NewDto): boolean {
  return (
    e.feedbackOrTechnical !== undefined &&
    e.feedbackOrTechnical.startsWith('No')
  );
}

function isTechnical(e: NewDto): boolean {
  return (
    e.feedbackOrTechnical !== undefined &&
    e.feedbackOrTechnical.startsWith('Yes')
  );
}

export class NewDto {
  @IsNotEmpty({
    message: 'feedback.errors.feedbackOrTechnical.empty',
  })
  feedbackOrTechnical: string;

  @ValidateIf(isFeedback)
  @IsNotEmpty({
    message: 'feedback.errors.satisfaction.empty',
  })
  satisfaction: string;

  @ValidateIf(isFeedback)
  @IsNotEmpty({
    message: 'feedback.errors.improvements.empty',
  })
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'feedback.errors.improvements.long',
  })
  improvements: string;

  @ValidateIf(isFeedback)
  @IsNotEmpty({
    message: 'feedback.errors.visitReason.empty',
  })
  visitReason: string;

  @ValidateIf(isFeedback)
  @ValidateIf((e) => e.visitReason === 'Other')
  @IsNotEmpty({
    message: 'feedback.errors.visitReasonOther.empty',
  })
  @MaxLength(MAX_SINGLE_LINE_LENGTH, {
    message: 'feedback.errors.visitReasonOther.long',
  })
  visitReasonOther: string;

  @ValidateIf(isFeedback)
  @IsNotEmpty({
    message: 'feedback.errors.contactAuthority.empty',
  })
  contactAuthority: string;

  @ValidateIf(isFeedback)
  @ValidateIf((e) => e.contactAuthority === 'No')
  @IsNotEmpty({
    message: 'feedback.errors.contactAuthorityNoReason.empty',
  })
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'feedback.errors.contactAuthorityNoReason.long',
  })
  contactAuthorityNoReason: string;

  @ValidateIf(isFeedback)
  @IsNotEmpty({
    message: 'feedback.errors.betaSurveyYesNo.empty',
  })
  betaSurveyYesNo: string;

  @ValidateIf(isFeedback)
  @ValidateIf((e) => e.betaSurveyYesNo === 'Yes')
  @IsNotEmpty({
    message: 'feedback.errors.betaSurveyEmail.empty',
  })
  @MaxLength(MAX_SINGLE_LINE_LENGTH, {
    message: 'feedback.errors.betaSurveyEmail.long',
  })
  betaSurveyEmail: string;

  @ValidateIf(isTechnical)
  @IsNotEmpty({
    message: 'feedback.errors.problemArea.empty',
  })
  problemArea: string;

  @ValidateIf(isTechnical)
  @ValidateIf((e) => e.problemArea === 'A specific page')
  @IsNotEmpty({
    message: 'feedback.errors.problemAreaPage.empty',
  })
  @MaxLength(MAX_SINGLE_LINE_LENGTH, {
    message: 'feedback.errors.problemAreaPage.long',
  })
  problemAreaPage: string;

  @ValidateIf(isTechnical)
  @IsNotEmpty({
    message: 'feedback.errors.problemDescription.empty',
  })
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'feedback.errors.problemDescription.long',
  })
  problemDescription: string;
}

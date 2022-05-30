import { Transform } from 'class-transformer';
import { IsNotEmpty, ValidateIf, IsUrl, MaxLength } from 'class-validator';
import {
  MAX_MULTI_LINE_LENGTH,
  MAX_URL_LENGTH,
} from '../../../helpers/input-limits';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';
import { OtherCountriesRecognitionRoutes } from '../../../qualifications/qualification.entity';

export class QualificationsDto {
  @IsNotEmpty({
    message: 'professions.form.errors.qualification.routesToObtain.empty',
  })
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'professions.form.errors.qualification.routesToObtain.long',
  })
  routesToObtain: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.qualification.moreInformationUrl.invalid',
  })
  @MaxLength(MAX_URL_LENGTH, {
    message: 'professions.form.errors.qualification.moreInformationUrl.long',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.moreInformationUrl)
  moreInformationUrl: string;

  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'professions.form.errors.qualification.ukRecognition.long',
  })
  @ValidateIf((e) => e.ukRecognition)
  ukRecognition: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.qualification.ukRecognitionUrl.invalid',
  })
  @MaxLength(MAX_URL_LENGTH, {
    message: 'professions.form.errors.qualification.ukRecognitionUrl.long',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.ukRecognitionUrl)
  ukRecognitionUrl: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.qualification.otherCountriesRecognitionRoutes.empty',
  })
  otherCountriesRecognitionRoutes: OtherCountriesRecognitionRoutes;

  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message:
      'professions.form.errors.qualification.otherCountriesRecognitionSummary.long',
  })
  otherCountriesRecognitionSummary: string;

  @IsUrl(urlOptions, {
    message:
      'professions.form.errors.qualification.otherCountriesRecognitionUrl.invalid',
  })
  @MaxLength(MAX_URL_LENGTH, {
    message:
      'professions.form.errors.qualification.otherCountriesRecognitionUrl.long',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.otherCountriesRecognitionUrl)
  otherCountriesRecognitionUrl: string;
}

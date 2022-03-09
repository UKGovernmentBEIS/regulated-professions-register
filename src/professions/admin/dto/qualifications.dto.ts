import { Transform } from 'class-transformer';
import { IsNotEmpty, ValidateIf, IsUrl } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

export class QualificationsDto {
  @IsNotEmpty({
    message: 'professions.form.errors.qualification.routesToObtain.empty',
  })
  routesToObtain: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.qualification.moreInformationUrl.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.moreInformationUrl)
  moreInformationUrl: string;

  ukRecognition: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.qualification.ukRecognitionUrl.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.ukRecognitionUrl)
  ukRecognitionUrl: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}

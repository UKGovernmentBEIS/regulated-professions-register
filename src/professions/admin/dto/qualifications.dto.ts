import { Transform } from 'class-transformer';
import { IsNotEmpty, ValidateIf, IsUrl } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

export class QualificationsDto {
  @IsNotEmpty({ message: 'professions.form.errors.qualification.level.empty' })
  level: string;

  @IsNotEmpty({
    message: 'professions.form.errors.qualification.routesToObtain.empty',
  })
  routesToObtain: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.qualification.mostCommonRouteToObtain.empty',
  })
  mostCommonRouteToObtain: string;

  @IsNotEmpty({
    message: 'professions.form.errors.qualification.duration.empty',
  })
  duration: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.qualification.mandatoryProfessionalExperience.empty',
  })
  mandatoryProfessionalExperience: string;

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

  otherCountriesRecognition: string;

  @IsUrl(urlOptions, {
    message:
      'professions.form.errors.qualification.otherCountriesRecognitionUrl.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.otherCountriesRecognitionUrl)
  otherCountriesRecognitionUrl: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}

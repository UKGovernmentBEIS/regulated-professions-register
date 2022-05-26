import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUrl, MaxLength, ValidateIf } from 'class-validator';
import {
  MAX_MULTI_LINE_LENGTH,
  MAX_URL_LENGTH,
} from '../../../helpers/input-limits';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';
import { RegulationType } from '../../profession-version.entity';

export class RegulatedActivitiesDto {
  @IsNotEmpty({ message: 'professions.form.errors.regulationSummary.empty' })
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'professions.form.errors.regulationSummary.long',
  })
  regulationSummary: string;

  @IsNotEmpty({ message: 'professions.form.errors.regulationType.empty' })
  regulationType: RegulationType;

  @IsNotEmpty({ message: 'professions.form.errors.reservedActivities.empty' })
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'professions.form.errors.reservedActivities.long',
  })
  reservedActivities: string;

  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'professions.form.errors.protectedTitles.long',
  })
  protectedTitles: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.regulationUrl.invalid',
  })
  @MaxLength(MAX_URL_LENGTH, {
    message: 'professions.form.errors.regulationUrl.long',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.regulationUrl)
  regulationUrl: string;
}

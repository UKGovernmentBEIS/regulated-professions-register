import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

export class RegulatedActivitiesDto {
  @IsNotEmpty({ message: 'professions.form.errors.regulationSummary.empty' })
  regulationSummary: string;

  @IsNotEmpty({ message: 'professions.form.errors.reservedActivities.empty' })
  reservedActivities: string;

  protectedTitles: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.regulationUrl.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.regulationUrl)
  regulationUrl: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}

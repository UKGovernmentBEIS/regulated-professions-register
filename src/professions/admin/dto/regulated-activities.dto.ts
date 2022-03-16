import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';
import { RegulationType } from '../../profession-version.entity';

export class RegulatedActivitiesDto {
  @IsNotEmpty({ message: 'professions.form.errors.regulationSummary.empty' })
  regulationSummary: string;

  @IsNotEmpty({ message: 'professions.form.errors.regulationType.empty' })
  regulationType: RegulationType;

  @IsNotEmpty({ message: 'professions.form.errors.reservedActivities.empty' })
  reservedActivities: string;

  protectedTitles: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.regulationUrl.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.regulationUrl)
  regulationUrl: string;
}

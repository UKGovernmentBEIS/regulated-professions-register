import { IsNotEmpty } from 'class-validator';

export class RegulatedActivitiesDto {
  @IsNotEmpty({ message: 'professions.form.errors.regulationSummary.empty' })
  regulationSummary: string;

  @IsNotEmpty({ message: 'professions.form.errors.reservedActivities.empty' })
  reservedActivities: string;

  protectedTitles: string;
  regulationUrl: string;

  change: string;
}

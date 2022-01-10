import { IsNotEmpty } from 'class-validator';

export class RegulatedActivitiesDto {
  @IsNotEmpty({ message: 'professions.form.errors.reservedActivities.empty' })
  activities: string;

  @IsNotEmpty({
    message: 'professions.form.errors.description.empty',
  })
  description: string;

  change: boolean;
}

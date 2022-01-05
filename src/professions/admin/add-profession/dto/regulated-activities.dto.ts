import { IsNotEmpty } from 'class-validator';

export class RegulatedActivitiesDto {
  @IsNotEmpty()
  activities: string;

  @IsNotEmpty()
  description: string;
}

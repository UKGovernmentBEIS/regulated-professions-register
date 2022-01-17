import { IsNotEmpty } from 'class-validator';

export class TopLevelDetailsDto {
  @IsNotEmpty({ message: 'professions.form.errors.name.empty' })
  name: string;

  @IsNotEmpty({ message: 'professions.form.errors.nations.empty' })
  nations: string[];

  @IsNotEmpty({ message: 'professions.form.errors.industries.empty' })
  industries: string[];

  change: boolean;
}

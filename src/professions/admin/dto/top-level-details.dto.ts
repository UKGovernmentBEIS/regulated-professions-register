import { IsNotEmpty } from 'class-validator';

export class TopLevelDetailsDto {
  @IsNotEmpty({ message: 'professions.form.errors.name.empty' })
  name: string;

  change: string;
}

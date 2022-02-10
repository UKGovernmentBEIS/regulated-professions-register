import { IsNotEmpty, ValidateIf, IsIn } from 'class-validator';

export class TopLevelDetailsDto {
  @IsNotEmpty({ message: 'professions.form.errors.name.empty' })
  name: string;

  @IsIn(['1', '0'], { message: 'professions.form.errors.nations.empty' })
  coversUK: string;

  @IsNotEmpty({ message: 'professions.form.errors.nations.empty' })
  @ValidateIf((e) => e.coversUK === '0')
  nations: string[];

  @IsNotEmpty({ message: 'professions.form.errors.industries.empty' })
  industries: string[];

  change: boolean;
}

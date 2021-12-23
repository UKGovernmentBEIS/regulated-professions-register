import { IsNotEmpty } from 'class-validator';

export class TopLevelDetailsDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  nations: string[];

  @IsNotEmpty()
  industries: string[];

  change: boolean;
}

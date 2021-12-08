import { IsNotEmpty } from 'class-validator';

export class TopLevelDetailsDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  nation: string;

  @IsNotEmpty()
  industryId: string;
}

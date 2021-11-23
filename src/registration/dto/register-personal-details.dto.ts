import { IsBooleanString, IsNotEmpty } from 'class-validator';

export class RegisterPersonalDetailsDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsBooleanString()
  edit: string;
}

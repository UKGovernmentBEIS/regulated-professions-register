import { IsBooleanString, IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterPersonalDetailsDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsBooleanString()
  edit: string;
}

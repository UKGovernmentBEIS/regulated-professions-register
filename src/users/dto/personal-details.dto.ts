import { IsBooleanString, IsEmail, IsNotEmpty } from 'class-validator';

export class PersonalDetailsDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsBooleanString()
  edit: string;
}

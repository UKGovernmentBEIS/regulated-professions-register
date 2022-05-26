import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../role';
import { UserEditSource } from '../../users.controller';

export class RoleDto {
  @IsNotEmpty({
    message: 'users.form.errors.role.empty',
  })
  @IsEnum(Role)
  role: Role;

  source: UserEditSource;
}

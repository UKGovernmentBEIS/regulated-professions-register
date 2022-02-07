import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../role';

export class RoleDto {
  @IsNotEmpty({
    message: 'users.form.errors.role.empty',
  })
  @IsEnum(Role)
  role: Role;

  change: string;
}

import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';
import { Role } from '../../role';

export class RoleDto {
  @IsNotEmpty({
    message: 'users.form.errors.role.empty',
  })
  @IsEnum(Role)
  role: Role;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}

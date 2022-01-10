import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../user.entity';

export class RolesDto {
  @IsNotEmpty({
    message: 'users.form.errors.roles.empty',
  })
  roles: Array<UserRole>;

  @Type(() => Boolean)
  @IsNotEmpty({
    message: 'users.form.errors.serviceOwner.empty',
  })
  serviceOwner: boolean;

  change: boolean;
}

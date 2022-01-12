import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { UserPermission } from '../../user.entity';

export class PermissionsDto {
  @IsNotEmpty({
    message: 'users.form.errors.roles.empty',
  })
  permissions: Array<UserPermission>;

  @Type(() => Boolean)
  @IsNotEmpty({
    message: 'users.form.errors.serviceOwner.empty',
  })
  serviceOwner: boolean;

  change: boolean;
}

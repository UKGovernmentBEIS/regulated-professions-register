import { IsNotEmpty } from 'class-validator';
import { UserRole } from '../../user.entity';

export class RolesDto {
  @IsNotEmpty()
  roles: Array<UserRole>;

  change: boolean;
}

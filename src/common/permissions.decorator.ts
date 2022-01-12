import { SetMetadata } from '@nestjs/common';
import { UserPermission } from '../users/user.entity';

export const Permissions = (...permissions: UserPermission[]) =>
  SetMetadata('permissions', permissions);

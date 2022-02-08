import { SetMetadata } from '@nestjs/common';
import { UserPermission } from '../users/user-permission';

export const Permissions = (...permissions: UserPermission[]) =>
  SetMetadata('permissions', permissions);

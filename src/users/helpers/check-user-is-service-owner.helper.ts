import { UnauthorizedException } from '@nestjs/common';
import { User } from '../user.entity';

export function checkUserIsServiceOwner(user: User): void {
  if (!user) {
    throw new UnauthorizedException();
  }

  if (!user.serviceOwner) {
    throw new UnauthorizedException();
  }
}

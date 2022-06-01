import { I18nService } from 'nestjs-i18n';
import { User } from '../user.entity';

export function getUserOrganisation(
  user: User,
  i18nService: I18nService,
): string {
  const isBEISUser = user.serviceOwner;

  return isBEISUser
    ? i18nService.translate<string>('app.beis')
    : user.organisation.name;
}

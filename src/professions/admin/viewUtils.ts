import { I18nService } from 'nestjs-i18n';
import { isConfirmed } from '../../helpers/is-confirmed';
import { Profession } from '../profession.entity';

export default class ViewUtils {
  static captionText(i18nService: I18nService, profession: Profession): string {
    if (isConfirmed(profession)) {
      return i18nService.translate<string>('professions.form.captions.edit', {
        args: { professionName: profession.name },
      }) as string;
    }

    if (profession.name) {
      return i18nService.translate<string>(
        'professions.form.captions.addWithName',
        {
          args: { professionName: profession.name },
        },
      ) as string;
    }

    return i18nService.translate<string>(
      'professions.form.captions.add',
    ) as string;
  }
}

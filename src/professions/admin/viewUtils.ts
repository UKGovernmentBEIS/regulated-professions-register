import { I18nService } from 'nestjs-i18n';
import { isConfirmed } from '../../helpers/is-confirmed';
import { Profession } from '../profession.entity';

export default class ViewUtils {
  static async captionText(
    i18nService: I18nService,
    profession: Profession,
  ): Promise<string> {
    if (isConfirmed(profession)) {
      return i18nService.translate('professions.form.captions.edit', {
        args: { professionName: profession.name },
      });
    }

    if (profession.name) {
      return i18nService.translate('professions.form.captions.addWithName', {
        args: { professionName: profession.name },
      });
    }

    return i18nService.translate('professions.form.captions.add');
  }
}

import { I18nService } from 'nestjs-i18n';
import { Nation } from '../nation';

export async function stringifyNations(
  nations: Nation[],
  i18nService: I18nService,
): Promise<string> {
  if (
    Nation.all().every(
      (nation) =>
        !!nations.find((inputNation) => inputNation.code === nation.code),
    )
  ) {
    return i18nService.translate('app.unitedKingdom');
  } else {
    const translatedNations = await Promise.all(
      nations.map((nation) => nation.translatedName(i18nService)),
    );

    return translatedNations.join(', ');
  }
}

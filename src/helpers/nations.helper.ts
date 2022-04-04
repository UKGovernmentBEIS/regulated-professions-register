import { I18nService } from 'nestjs-i18n';
import { stringifyNations } from '../nations/helpers/stringifyNations';
import { Profession } from '../professions/profession.entity';
import { Nation } from './../nations/nation';

export function allNations(): string[] {
  return Nation.all().map((nation) => nation.code);
}

export function isUK(nationCodes: string[]) {
  const nations = allNations();

  return (
    nationCodes.length === nations.length &&
    nationCodes.every((e, i) => e === nations[i])
  );
}

export async function getNationsFromProfessions(
  professions: Profession[],
  i18nService: I18nService,
): Promise<string> {
  const nationCodes = professions
    .map((profession) => profession.occupationLocations || [])
    .flat();

  const nations = [...new Set(nationCodes)].map((code) => Nation.find(code));

  return await stringifyNations(nations, i18nService);
}

import { I18nService } from 'nestjs-i18n';

export class Nation {
  name: string;
  code: string;

  constructor(name: string, code: string) {
    this.name = name;
    this.code = code;
  }

  translatedName(i18nService: I18nService): string {
    return i18nService.translate<string>(this.name) as string;
  }

  static all(): Nation[] {
    const rawNations: {
      name: string;
      code: string;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
    }[] = require('../config/nations.json');

    return rawNations.map(
      (rawNation) => new Nation(rawNation.name, rawNation.code),
    );
  }

  static find(code: string): Nation {
    const selectedNation = Nation.all().find((nation) => nation.code === code);

    if (!selectedNation) {
      throw new Error('Could not find requested Nation');
    }

    return new Nation(selectedNation.name, selectedNation.code);
  }
}

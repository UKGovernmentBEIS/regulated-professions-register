export class Nation {
  name: string;
  code: string;

  constructor(name: string, code: string) {
    this.name = name;
    this.code = code;
  }

  static all(): Nation[] {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nations: Nation[] = require('../config/nations.json');

    return nations;
  }

  static find(code: string): Nation {
    const selectedNation = Nation.all().find((nation) => nation.code === code);

    if (!selectedNation) {
      throw new Error('Could not find requested Nation');
    }

    return new Nation(selectedNation.name, selectedNation.code);
  }
}

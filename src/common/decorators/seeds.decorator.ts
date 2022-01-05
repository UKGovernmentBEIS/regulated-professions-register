import { Seeder } from 'nestjs-seeder';

export function InjectData(filename: string) {
  return function (target: Seeder, propertyKey: string) {
    const environment = process.env['NODE_ENV'] || 'development';
    const path = `../../../seeds/${environment}/${filename}.json`;
    let value: Array<any>;

    try {
      /* eslint-disable @typescript-eslint/no-var-requires */
      const json = require(path);
      value = json;
    } catch (e) {
      value = [];
    }

    Object.defineProperty(target, propertyKey, {
      get: () => {
        return value;
      },
    });
  };
}

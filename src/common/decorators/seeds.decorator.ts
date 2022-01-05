import { Seeder } from 'nestjs-seeder';

export function InjectData(filename: string) {
  return function (target: Seeder, propertyKey: string) {
    const nodeEnv = process.env['NODE_ENV'] || 'development';
    const environment = process.env['ENVIRONMENT'];
    let value: Array<any>;

    const path =
      nodeEnv === 'production'
        ? `../../../seeds/${environment}/${filename}.json`
        : `../../../seeds/${nodeEnv}/${filename}.json`;

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

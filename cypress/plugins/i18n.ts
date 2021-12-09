const dir = './src/i18n/en';

export const translate = (
  translation: string,
  personalisations: object = {},
) => {
  const references = translation.split('.');
  const filename = references.shift();
  const result = cy
    .readFile(`${dir}/${filename}.json`, 'utf8')
    .then((result) => {
      for (const i in references) {
        result = result[references[i]];
      }

      return result;
    })
    .then((result) => {
      Object.keys(personalisations).forEach((key) => {
        result = result.replace(`{${key}}`, personalisations[key]);
      });

      return result;
    });

  return result;
};

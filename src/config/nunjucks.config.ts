/* eslint @typescript-eslint/no-var-requires: "off" */

import { NestExpressApplication } from '@nestjs/platform-express';

import * as nunjucks from 'nunjucks';

import { AssetsHelper } from '../helpers/assets.helper';
import { formatMultilineString } from '../helpers/format-multiline-string.helper';
import { I18nHelper } from '../helpers/i18n.helper';

export const nunjucksConfig = async (
  app: NestExpressApplication,
  views: any,
): Promise<nunjucks.ConfigureOptions> => {
  const express = app.getHttpAdapter().getInstance();
  const entrypoints = require('../../public/entrypoints.json');
  const assetsHelper = new AssetsHelper(entrypoints);
  const i18nHelper = new I18nHelper(app);

  const env = nunjucks.configure(views, {
    noCache: process.env.NODE_ENV === 'development' ? true : false,
    express: express,
  });

  env.addGlobal('encore_entry_link_tags', await assetsHelper.entryLinksTags());
  env.addGlobal(
    'encore_entry_script_tags',
    await assetsHelper.entryScriptTags(),
  );
  env.addGlobal('environment', process.env['NODE_ENV']);
  env.addGlobal(
    'site_domain',
    process.env['HOST_URL'].replace(/https?:\/\//, '').split('/')[0],
  );
  env.addFilter(
    't',
    async (...args) => {
      const callback = args.pop();
      const text = args[0];
      const personalisation = args.length < 2 ? {} : args[1];
      try {
        const result = await i18nHelper.translate(text, personalisation);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    },
    true,
  );

  env.addFilter(
    'tError',
    async (...args) => {
      const callback = args.pop();
      const error = args[0];

      if (!error) {
        callback(null);
        return;
      }

      const personalisation = args.length < 2 ? {} : args[1];
      try {
        const result = {
          text: await i18nHelper.translate(error.text, personalisation),
        };
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    },
    true,
  );

  env.addFilter('multiline', (text, classes) => {
    return new nunjucks.runtime.SafeString(
      formatMultilineString(text, classes),
    );
  });

  return env;
};

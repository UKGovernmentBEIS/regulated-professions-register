import { NestExpressApplication } from '@nestjs/platform-express';

import * as nunjucks from 'nunjucks';

import { AssetsHelper } from '../helpers/assets.helper';
import { formatMultilineString } from '../helpers/format-multiline-string.helper';
import { formatLink } from '../helpers/format-link.helper';
import { I18nHelper } from '../helpers/i18n.helper';
import { formatEmail } from '../helpers/format-email.helper';
import { pad } from '../helpers/pad.helper';
import { formatStatus } from '../helpers/format-status.helper';

export const nunjucksConfig = async (
  app: NestExpressApplication,
  views: any,
): Promise<nunjucks.ConfigureOptions> => {
  const express = app.getHttpAdapter().getInstance();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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

  env.addFilter('link', (text) => {
    return new nunjucks.runtime.SafeString(formatLink(text));
  });

  env.addFilter('email', (text) => {
    return new nunjucks.runtime.SafeString(formatEmail(text));
  });

  env.addFilter('pad', (array, minimumLength) => {
    return pad(array, minimumLength);
  });

  env.addFilter(
    'status',
    async (...args) => {
      const callback = args.pop();
      const status = args[0];
      try {
        const result = new nunjucks.runtime.SafeString(
          await formatStatus(status, i18nHelper.i18nService),
        );
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    },
    true,
  );

  return env;
};

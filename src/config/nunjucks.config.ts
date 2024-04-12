import { NestExpressApplication } from '@nestjs/platform-express';

import * as nunjucks from 'nunjucks';

import { AssetsHelper, getGaTag } from '../helpers/assets.helper';
import { formatMultilineString } from '../helpers/format-multiline-string.helper';
import { formatLink } from '../helpers/format-link.helper';
import { I18nHelper } from '../helpers/i18n.helper';
import { formatEmail } from '../helpers/format-email.helper';
import { pad } from '../helpers/pad.helper';
import { formatStatus } from '../helpers/format-status.helper';
import { formatTelephone } from '../helpers/format-telephone.helper';
import { getDomain } from '../helpers/get-domain.helper';
import { sortLegislationsByIndex } from '../professions/helpers/sort-legislations-by-index.helper';

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
  env.addGlobal('site_domain', getDomain(process.env['HOST_URL']));
  env.addGlobal('ga_tag', getGaTag());
  env.addGlobal('ga_cookie_suffix', getGaTag().replace(/G-/g, '_'));
  env.addFilter('t', (text, personalisation) => {
    return i18nHelper.translate(text, personalisation || {});
  });

  env.addFilter('tError', (message, personalisation) => {
    if (!message) {
      return null;
    }

    const texts = message.text.split(',') as string[];

    return {
      html: texts
        .map((text) => i18nHelper.translate(text, personalisation || {}))
        .join('<br />'),
    };
  });

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

  env.addFilter('sortLegislations', (legislations) => {
    return legislations ? sortLegislationsByIndex(legislations) : [];
  });

  env.addFilter(
    'status',
    (...args) => {
      const callback = args.pop();
      const status = args[0];
      try {
        const result = new nunjucks.runtime.SafeString(
          formatStatus(status, i18nHelper.i18nService),
        );
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    },
    true,
  );

  env.addFilter('telephone', (text) => {
    return formatTelephone(text);
  });

  return env;
};

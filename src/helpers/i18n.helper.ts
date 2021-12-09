import { NestExpressApplication } from '@nestjs/platform-express';
import { I18nService } from 'nestjs-i18n';

/**
 * Returns a string from a translation reference
 *
 * This class allows us to use the NestJS i18n Service
 * to get a translation string from a reference.
 *
 * @constructor
 * @param {NestExpressApplication} app - A reference to the NestJS Express
 * application (this allows us to get a reference to the I18nService)
 */
export class I18nHelper {
  i18nService: I18nService;

  constructor(private app: NestExpressApplication) {
    this.i18nService = app.get<I18nService>(I18nService);
  }

  /**
   * Get a translated string from the i18n reference
   *
   * @param {text} - The translation reference (e.g `user.greeting`)
   * @param {any} - Any personalisations that need to be passed tho the translation
   * @returns {string} - The translated string (e.g `Hello world!`)
   */
  public async translate(
    text: string,
    personalisation: any = {},
  ): Promise<string> {
    return await this.i18nService.translate(text, { args: personalisation });
  }
}

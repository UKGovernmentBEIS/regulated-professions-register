import { AssetsHelper } from './assets.helper';

describe('AssetsHelper', () => {
  let entrypoints: any;
  let helper: AssetsHelper;

  beforeEach(async () => {
    entrypoints = {
      entrypoints: {
        app: {
          js: [
            '/runtime.js',
            '/vendors-node_modules_govuk-frontend_govuk_all_js.js',
            '/app.js',
          ],
          css: ['/app.css'],
        },
      },
    };
    helper = new AssetsHelper(entrypoints);
  });

  it('should return css link tags', async () => {
    expect(await helper.entryLinksTags()).toEqual({
      length: 39,
      val: '<link href="/app.css" rel="stylesheet">',
    });
  });

  it('should return js script tags', async () => {
    expect(await helper.entryScriptTags()).toEqual({
      length: 144,
      val: '<script src="/runtime.js"></script>\n<script src="/vendors-node_modules_govuk-frontend_govuk_all_js.js"></script>\n<script src="/app.js"></script>',
    });
  });
});

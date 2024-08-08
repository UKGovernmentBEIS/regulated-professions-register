import * as nunjucks from 'nunjucks';

export class AssetsHelper {
  entrypoints: any;

  constructor(entrypoints: any) {
    this.entrypoints = entrypoints;
  }

  public async entryLinksTags(): Promise<nunjucks.runtime.SafeString> {
    const css = this.entrypoints.entrypoints.app.css
      .map((cssFile: any) => {
        return `<link href="${cssFile}" rel="stylesheet">`;
      })
      .join('\n');

    return new nunjucks.runtime.SafeString(css);
  }

  public async entryScriptTags(): Promise<nunjucks.runtime.SafeString> {
    const js = this.entrypoints.entrypoints.app.js
      .map((jsFile: any) => {
        return `<script src="${jsFile}"></script>`;
      })
      .join('\n');

    return new nunjucks.runtime.SafeString(js);
  }
}

export function getGaTag(): string {
  return process.env['GA_TAG'] || '';
}

export function getGtmTag(): string {
  return process.env['GTM_TAG'] || '';
}

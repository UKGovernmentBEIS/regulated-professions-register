import * as nunjucks from 'nunjucks';

export function escape(text: string): string {
  const escape = new nunjucks.Environment().getFilter('escape');
  return escape(text).val;
}

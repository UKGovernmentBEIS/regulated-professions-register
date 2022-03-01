import { isURL } from 'class-validator';
import { escape } from './escape.helper';
import { preprocessUrl, urlOptions } from './preprocess-url.helper';

export function formatLink(url: string): string {
  if (!url) {
    return '';
  }

  const preprocessedUrl = preprocessUrl(url);

  if (!isURL(preprocessedUrl, urlOptions)) {
    return escape(url);
  }

  const escapedUrl = escape(preprocessedUrl);

  return `<a href="${escapedUrl}" class="govuk-link">${escapedUrl}</a>`;
}

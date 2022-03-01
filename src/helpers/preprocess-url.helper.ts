import { isURL } from 'class-validator';

export const urlOptions = {
  require_protocol: true,
  protocols: ['http', 'https'],
};

export function preprocessUrl(url: string): string {
  if (!url) {
    return url;
  }

  const trimmedUrl = url.trim();

  if (isURL(trimmedUrl, urlOptions)) {
    return trimmedUrl;
  }

  if (isURL(trimmedUrl, { ...urlOptions, require_protocol: false })) {
    const candidateUrl = `http://${trimmedUrl}`;

    if (isURL(candidateUrl, urlOptions)) {
      return candidateUrl;
    }
  }

  return url;
}

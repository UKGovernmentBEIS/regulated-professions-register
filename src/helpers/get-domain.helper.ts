export function getDomain(url: string): string {
  return url
    .replace(/https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
}

export function removeFromQueryString(
  queryString: string,
  remove: string,
): string {
  return queryString
    .replace(new RegExp(`${remove}=[^&]*[&]?`, 'g'), '')
    .replace(/&$/, '');
}

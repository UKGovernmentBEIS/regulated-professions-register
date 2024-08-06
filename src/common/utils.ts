import { format } from 'date-fns';
import { Request } from 'express';

export function getReferrer(req: Request): string {
  const referrer = req.get('Referrer') || '';
  const host = req.get('host');

  if (referrer.match('^https?://' + host)) {
    return referrer;
  }
}

export function formatDate(date: Date): string {
  return format(date, 'd MMM yyyy');
}

export function sortArrayByProperty<T>(
  arr: T[],
  prop: keyof T,
  ascending = true,
): T[] {
  return arr.slice().sort((a, b) => {
    const aValue = a[prop] as unknown as string;
    const bValue = b[prop] as unknown as string;

    if (aValue === 'Other') return ascending ? 1 : -1;
    if (bValue === 'Other') return ascending ? -1 : 1;

    if (aValue === bValue) return 0;

    if (ascending) {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });
}

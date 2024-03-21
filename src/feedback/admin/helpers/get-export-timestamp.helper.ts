import { format } from 'date-fns';

export function getExportTimestamp(): string {
  return format(new Date(), 'yyyyMMdd-HHmmss');
}

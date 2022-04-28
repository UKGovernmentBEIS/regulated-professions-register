import { Request } from 'express';

export function getQueryString(request: Request): string {
  return request.url.split('?')?.[1] || '';
}

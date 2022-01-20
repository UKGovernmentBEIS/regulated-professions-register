import { UseInterceptors } from '@nestjs/common';
import { BackLinkInterceptor } from '../back-link.interceptor';

export const BackLink = (backLink: string) =>
  UseInterceptors(new BackLinkInterceptor(backLink));

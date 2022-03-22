import { UseInterceptors } from '@nestjs/common';
import { BackLinkInterceptor, Generator } from '../back-link.interceptor';

export const BackLink = (arg: string | Generator, linkTitle = '') =>
  UseInterceptors(new BackLinkInterceptor(arg, linkTitle));

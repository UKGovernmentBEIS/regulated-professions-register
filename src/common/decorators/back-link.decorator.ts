import { UseInterceptors } from '@nestjs/common';
import { BackLinkInterceptor, Generator } from '../back-link.interceptor';

export const BackLink = (arg: string | Generator) =>
  UseInterceptors(new BackLinkInterceptor(arg));

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { translationOf } from './translation-of';

export function createMockI18nService(
  transations: {
    [key: string]: string;
  } = {},
): DeepMocked<I18nService> {
  const mock = createMock<I18nService>();

  mock.translate.mockImplementation(async (text: string) => {
    return transations[text] || translationOf(text);
  });

  return mock;
}

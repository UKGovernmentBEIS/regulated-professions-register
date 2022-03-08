import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { Nation } from '../nation';
import { stringifyNations } from './stringifyNations';

describe('stringifyNations', () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(() => {
    i18nService = createMockI18nService({
      'nations.england': 'England',
      'nations.scotland': 'Scotland',
      'nations.wales': 'Wales',
      'nations.northernIreland': 'Northern Ireland',
      'app.unitedKingdom': 'United Kingdom',
    });
  });

  it('translates a single nation', async () => {
    await expect(
      stringifyNations([Nation.find('GB-SCT')], i18nService),
    ).resolves.toEqual('Scotland');

    expect(i18nService.translate).toHaveBeenCalledWith('nations.scotland');
  });

  it('concatenates multiple nations', async () => {
    await expect(
      stringifyNations(
        [Nation.find('GB-ENG'), Nation.find('GB-WLS')],
        i18nService,
      ),
    ).resolves.toEqual('England, Wales');

    expect(i18nService.translate).toHaveBeenCalledWith('nations.england');
    expect(i18nService.translate).toHaveBeenCalledWith('nations.wales');
  });

  it('collapses multiple nations to "United Kingdom"', () => {
    expect(stringifyNations(Nation.all(), i18nService)).resolves.toEqual(
      'United Kingdom',
    );

    expect(i18nService.translate).toHaveBeenCalledWith('app.unitedKingdom');
    expect(i18nService.translate).not.toHaveBeenCalledWith('nations.england');
  });
});

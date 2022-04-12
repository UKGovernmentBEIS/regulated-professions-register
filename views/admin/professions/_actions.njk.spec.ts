import { JSDOM } from 'jsdom';
import * as nunjucks from 'nunjucks';
import { translationOf } from '../../../src/testutils/translation-of';
import professionVersionFactory from '../../../src/testutils/factories/profession-version';
import professionFactory from '../../../src/testutils/factories/profession';

import { ProfessionVersionStatus } from '../../../src/professions/profession-version.entity';
import { Profession } from '../../../src/professions/profession.entity';

import { nunjucksEnvironment } from '../../testutils/nunjucksEnvironment';

describe('_actions.njk', () => {
  beforeAll(async () => {
    await nunjucksEnvironment();
  });

  describe('when a user can change a profession', () => {
    it('should show the edit, publish and delete buttons', () => {
      const canChangeProfession = () => true;
      const professionVersion = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
      });
      const profession = Profession.withVersion(
        professionFactory.build(),
        professionVersion,
      );
      const permissions = [
        'publishProfession',
        'editProfession',
        'deleteProfession',
      ];

      nunjucks.render(
        'admin/professions/_actions.njk',
        { canChangeProfession, profession, permissions },
        function (_err, res) {
          expect(res).toMatch(
            translationOf('professions.admin.button.edit.draft'),
          );
          expect(res).toMatch(translationOf('professions.form.button.publish'));
          expect(res).toMatch(
            translationOf('professions.admin.button.archive'),
          );
        },
      );
    });
  });

  describe("when a user can't change a profession", () => {
    it('should hide the edit, publish and delete buttons', () => {
      const canChangeProfession = () => false;
      const professionVersion = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
      });
      const profession = Profession.withVersion(
        professionFactory.build(),
        professionVersion,
      );
      const permissions = [
        'publishProfession',
        'editProfession',
        'deleteProfession',
      ];

      nunjucks.render(
        'admin/professions/_actions.njk',
        { canChangeProfession, profession, permissions },
        function (_err, res) {
          expect(res).not.toMatch(
            translationOf('professions.admin.button.edit.draft'),
          );
          expect(res).not.toMatch(
            translationOf('professions.form.button.publish'),
          );
          expect(res).not.toMatch(
            translationOf('professions.admin.button.archive'),
          );
        },
      );
    });
  });
});

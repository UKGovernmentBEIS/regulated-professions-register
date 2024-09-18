import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { SlugGenerator } from './slug-generator';

import { ProfessionsService } from '../professions/professions.service';
import { OrganisationsService } from '../organisations/organisations.service';

import organisationFactory from '../testutils/factories/organisation';
import professionFactory from '../testutils/factories/profession';

describe('SlugGenerator', () => {
  describe('When the service is an OrganisationsService', () => {
    let service: DeepMocked<OrganisationsService>;

    beforeEach(() => {
      service = createMock<OrganisationsService>();
    });

    describe('when a slug does not exist', () => {
      it('generates a slug without a number', async () => {
        service.findBySlug.mockResolvedValue(undefined);

        const generator = new SlugGenerator(service, 'Some Name');

        expect(await generator.slug()).toEqual('some-name');
      });
    });

    describe('when a slug exists', () => {
      it('generates a slug with a number', async () => {
        service.findBySlug.mockImplementation(async (slug) => {
          if (slug === 'some-name') {
            return organisationFactory.build();
          } else if (slug === 'some-name-1') {
            return organisationFactory.build();
          }
        });

        const generator = new SlugGenerator(service, 'Some Name');

        expect(await generator.slug()).toEqual('some-name-2');
      });
    });
  });

  describe('When the service is a ProfessionsService', () => {
    let service: DeepMocked<ProfessionsService>;

    beforeEach(() => {
      service = createMock<ProfessionsService>();
    });

    describe('when a slug does not exist', () => {
      it('generates a slug without a number', async () => {
        service.findBySlug.mockResolvedValue(undefined);

        const generator = new SlugGenerator(service, 'Some Name');

        expect(await generator.slug()).toEqual('some-name');
      });
    });

    describe('when a slug exists', () => {
      it('generates a slug with a number', async () => {
        service.findBySlug.mockImplementation(async (slug) => {
          if (slug === 'some-name') {
            return professionFactory.build();
          } else if (slug === 'some-name-1') {
            return professionFactory.build();
          }
        });

        const generator = new SlugGenerator(service, 'Some Name');

        expect(await generator.slug()).toEqual('some-name-2');
      });
    });
  });
});

import slugify from 'slugify';

import { ProfessionsService } from '../professions/professions.service';
import { OrganisationsService } from '../organisations/organisations.service';

const maxLength = 100;

export class SlugGenerator {
  constructor(
    private readonly service: ProfessionsService | OrganisationsService,
    private readonly name: string,
  ) {}

  public async slug() {
    let slug: string;

    try {
      let retryCount = 0;

      while (true) {
        slug = this.slugify(retryCount);
        const result = await this.service.findBySlug(slug);

        if (result) {
          retryCount++;
        } else {
          break;
        }
      }
    } finally {
      return slug;
    }
  }

  private slugify(retryCount: number): string {
    const base = slugify(this.name, {
      remove: /[^a-zA-Z0-9 ]/,
      replacement: '-',
      lower: true,
      strict: true,
      trim: true,
    }).slice(0, maxLength);

    return retryCount === 0 ? base : `${base}-${retryCount}`;
  }
}

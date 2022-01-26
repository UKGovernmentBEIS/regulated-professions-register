import { OrganisationDto } from './admin/dto/organisation.dto';
import { OrganisationVersion } from './organisation-version.entity';

describe('OrganisationVersion', () => {
  describe('fromDto', () => {
    it('should return an entity based on a DTO', () => {
      const dto = new OrganisationDto();

      dto.alternateName = 'alternateName';
      dto.address = 'address';
      dto.url = 'url';
      dto.email = 'email';
      dto.contactUrl = 'contactUrl';
      dto.telephone = 'telephone';
      dto.fax = 'fax';

      expect(OrganisationVersion.fromDto(dto)).toEqual({
        alternateName: 'alternateName',
        address: 'address',
        url: 'url',
        email: 'email',
        contactUrl: 'contactUrl',
        telephone: 'telephone',
        fax: 'fax',
      });
    });
  });
});

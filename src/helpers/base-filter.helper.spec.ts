import { Industry } from '../industries/industry.entity';
import { Nation } from '../nations/nation';
import { Organisation } from '../organisations/organisation.entity';
import { BaseFilterHelper } from './base-filter.helper';
import organisationFactory from '../testutils/factories/organisation';
import industryFactory from '../testutils/factories/industry';
import { RegulationType } from '../professions/profession-version.entity';

interface DummySubject {
  id: string;
}

class DummyFilterHelper extends BaseFilterHelper<DummySubject> {
  protected nationCodesFromSubject(subject: DummySubject): string[] {
    return nationCodesFromSubject(subject);
  }

  protected organisationsFromSubject(subject: DummySubject): Organisation[] {
    return organisationsFromSubject(subject);
  }

  protected industriesFromSubject(subject: DummySubject): Industry[] {
    return industriesFromSubject(subject);
  }

  protected regulationTypesFromSubject(
    subject: DummySubject,
  ): RegulationType[] {
    return regulationTypesFromSubject(subject);
  }

  protected nameFromSubject(subject: DummySubject): string {
    return nameFromSubject(subject);
  }
}

const subject1: DummySubject = { id: 'subject-1' };
const subject2: DummySubject = { id: 'subject-2' };
const subject3: DummySubject = { id: 'subject-3' };
const subject4: DummySubject = { id: 'subject-4' };
const subject5: DummySubject = { id: 'subject-5' };
const subject6: DummySubject = { id: 'subject-6' };

const nationCodesFromSubject = jest.fn();
const organisationsFromSubject = jest.fn();
const industriesFromSubject = jest.fn();
const regulationTypesFromSubject = jest.fn();
const nameFromSubject = jest.fn();

describe('BaseFilterHelper', () => {
  describe('filter', () => {
    let filterHelper: DummyFilterHelper;

    beforeEach(() => {
      filterHelper = new DummyFilterHelper([
        subject1,
        subject2,
        subject3,
        subject4,
        subject5,
        subject6,
      ]);
    });

    describe('when filter input is empty', () => {
      it('does not call any extraction methods', () => {
        filterHelper.filter({});

        expect(nationCodesFromSubject).not.toBeCalled();
        expect(organisationsFromSubject).not.toBeCalled();
        expect(industriesFromSubject).not.toBeCalled();
        expect(regulationTypesFromSubject).not.toBeCalled();
        expect(nameFromSubject).not.toBeCalled();
      });

      it('returns all input subjects', () => {
        expect(filterHelper.filter({})).toEqual([
          subject1,
          subject2,
          subject3,
          subject4,
          subject5,
          subject6,
        ]);
      });
    });

    describe('when filter input has empty keywords', () => {
      it('does not call any extraction methods', () => {
        filterHelper.filter({
          keywords: '',
        });

        expect(nationCodesFromSubject).not.toBeCalled();
        expect(organisationsFromSubject).not.toBeCalled();
        expect(industriesFromSubject).not.toBeCalled();
        expect(regulationTypesFromSubject).not.toBeCalled();
        expect(nameFromSubject).not.toBeCalled();
      });
    });

    describe('when filter input has non-empty keywords', () => {
      it('calls the name extraction method', () => {
        nameFromSubject.mockReturnValue('');

        filterHelper.filter({
          keywords: 'nuclear',
        });

        expect(nameFromSubject).toBeCalledTimes(6);

        expect(nationCodesFromSubject).not.toBeCalled();
        expect(organisationsFromSubject).not.toBeCalled();
        expect(industriesFromSubject).not.toBeCalled();
        expect(regulationTypesFromSubject).not.toBeCalled();
      });

      it('matches against the return value of the name extraction method', () => {
        nameFromSubject.mockImplementation((subject) => {
          if (subject == subject3) {
            return 'Example Name';
          } else {
            return 'Another Name';
          }
        });

        expect(
          filterHelper.filter({
            keywords: 'Example',
          }),
        ).toEqual([subject3]);
      });

      it('matching is not case sensitive', () => {
        nameFromSubject.mockImplementation((subject) => {
          if (subject === subject1) {
            return 'Example Name';
          } else if (subject === subject3) {
            return 'example Name';
          } else {
            return 'Another Name';
          }
        });

        expect(
          filterHelper.filter({
            keywords: 'eXaMplE',
          }),
        ).toEqual([subject1, subject3]);
      });

      it('matching ignores spaces', () => {
        nameFromSubject.mockImplementation((subject) => {
          if (subject === subject1) {
            return 'Example Name';
          } else {
            return 'Another Name';
          }
        });

        expect(
          filterHelper.filter({
            keywords: '    Example    ',
          }),
        ).toEqual([subject1]);
      });

      it('matching allows partial word matches', () => {
        nameFromSubject.mockImplementation((subject) => {
          if (subject === subject3) {
            return 'Example Name';
          } else {
            return 'Another Name';
          }
        });

        expect(
          filterHelper.filter({
            keywords: 'ampl',
          }),
        ).toEqual([subject3]);
      });

      it('matching allows multiple search terms', () => {
        nameFromSubject.mockImplementation((subject) => {
          if (subject === subject1) {
            return 'Example Name';
          } else if (subject === subject2) {
            return 'Another Name';
          } else if (subject === subject3) {
            return 'Yet Another Name';
          } else {
            return '';
          }
        });

        expect(
          filterHelper.filter({
            keywords: 'Example Yet',
          }),
        ).toEqual([subject1, subject3]);
      });
    });

    describe('when filter input has nations', () => {
      it('calls the nation extractor method', () => {
        nationCodesFromSubject.mockReturnValue([]);

        filterHelper.filter({
          nations: [Nation.find('GB-NIR')],
        });

        expect(nationCodesFromSubject).toBeCalledTimes(6);

        expect(organisationsFromSubject).not.toBeCalled();
        expect(industriesFromSubject).not.toBeCalled();
        expect(regulationTypesFromSubject).not.toBeCalled();
        expect(nameFromSubject).not.toBeCalled();
      });

      it('matches against the return value of the nations extractor method', () => {
        nationCodesFromSubject.mockImplementation((subject) => {
          if (subject == subject1) {
            return ['GB-SCT'];
          } else if (subject === subject2) {
            // Test complete match against provided nations
            return ['GB-NIR', 'GB-ENG'];
          } else if (subject === subject3) {
            // Test partial match against provided nations
            return ['GB-ENG'];
          } else {
            return [];
          }
        });

        expect(
          filterHelper.filter({
            nations: [Nation.find('GB-NIR'), Nation.find('GB-ENG')],
          }),
        ).toEqual([subject2, subject3]);
      });
    });

    describe('when filter input has organisations', () => {
      it('calls the organisation extractor method', () => {
        organisationsFromSubject.mockReturnValue([]);

        filterHelper.filter({
          organisations: [organisationFactory.build()],
        });

        expect(organisationsFromSubject).toBeCalledTimes(6);

        expect(nationCodesFromSubject).not.toBeCalled();
        expect(industriesFromSubject).not.toBeCalled();
        expect(regulationTypesFromSubject).not.toBeCalled();
        expect(nameFromSubject).not.toBeCalled();
      });

      it('matches against the return value of the organisation extractor method, using organisation IDs', () => {
        const organisation1 = organisationFactory.build();
        const organisation2 = organisationFactory.build();
        const organisation3 = organisationFactory.build();

        organisationsFromSubject.mockImplementation((subject) => {
          if (subject === subject1) {
            // Test partial match against provided organisationss
            return [organisation1];
          } else if (subject === subject2) {
            // Test complete match against provided organisations
            return [organisation1, organisation2];
          } else if (subject === subject3) {
            return [organisation3];
          } else {
            return [];
          }
        });

        expect(
          filterHelper.filter({
            organisations: [
              organisationFactory.build({ id: organisation2.id }),
              organisationFactory.build({ id: organisation1.id }),
            ],
          }),
        ).toEqual([subject1, subject2]);
      });
    });

    describe('when filter input has industries', () => {
      it('calls the industries extractor method', () => {
        industriesFromSubject.mockReturnValue([]);

        filterHelper.filter({
          industries: [industryFactory.build()],
        });

        expect(industriesFromSubject).toBeCalledTimes(6);

        expect(nationCodesFromSubject).not.toBeCalled();
        expect(organisationsFromSubject).not.toBeCalled();
        expect(regulationTypesFromSubject).not.toBeCalled();
        expect(nameFromSubject).not.toBeCalled();
      });

      it('matches against the return value of the industries extractor method, using industry IDs', () => {
        const industry1 = industryFactory.build();
        const industry2 = industryFactory.build();
        const industry3 = industryFactory.build();

        industriesFromSubject.mockImplementation((subject) => {
          if (subject === subject1) {
            return [industry1];
          } else if (subject === subject2) {
            // Test partial match against provided industries
            return [industry2];
          } else if (subject === subject3) {
            // Test complete match against provided industries
            return [industry2, industry3];
          } else {
            return [];
          }
        });

        expect(
          filterHelper.filter({
            industries: [
              industryFactory.build({ id: industry2.id }),
              industryFactory.build({ id: industry3.id }),
            ],
          }),
        ).toEqual([subject2, subject3]);
      });
    });

    describe('when filter input has regulation types', () => {
      it('calls the regulationTypes extractor method', () => {
        regulationTypesFromSubject.mockReturnValue([]);

        filterHelper.filter({
          regulationTypes: [RegulationType.Licensing],
        });

        expect(regulationTypesFromSubject).toBeCalledTimes(6);

        expect(nationCodesFromSubject).not.toBeCalled();
        expect(organisationsFromSubject).not.toBeCalled();
        expect(industriesFromSubject).not.toBeCalled();
        expect(nameFromSubject).not.toBeCalled();
      });

      it('matches against the return value of the regulation type extractor method', () => {
        regulationTypesFromSubject.mockImplementation((subject) => {
          if (subject === subject1) {
            return [RegulationType.Certification];
          } else if (subject === subject2) {
            // Test partial match against provided regulation types
            return [RegulationType.Licensing];
          } else if (subject === subject3) {
            // Test complete match against provided regulation types
            return [RegulationType.Licensing, RegulationType.Accreditation];
          } else {
            return [];
          }
        });

        expect(
          filterHelper.filter({
            regulationTypes: [
              RegulationType.Accreditation,
              RegulationType.Licensing,
            ],
          }),
        ).toEqual([subject2, subject3]);
      });
    });

    describe('when filter input has multiple criteria', () => {
      it('matches against all critera', () => {
        const matchingNationCode = 'GB-WLS';
        const nonMatchingNationCode = 'GB-ENG';

        const matchingOrganisation = organisationFactory.build();
        const nonMatchingOrganisation = organisationFactory.build();

        const matchingIndustry = industryFactory.build();
        const nonMatchingIndustry = industryFactory.build();

        const matchingRegulationType = RegulationType.Accreditation;
        const nonMatchingRegulationType = RegulationType.Certification;

        const matchingName = 'Teacher';
        const nonMatchingName = 'Dentist';

        nationCodesFromSubject.mockImplementation((subject) => {
          if (subject === subject1) {
            return [nonMatchingNationCode];
          } else {
            return [matchingNationCode];
          }
        });

        organisationsFromSubject.mockImplementation((subject) => {
          if (subject === subject2) {
            return [nonMatchingOrganisation];
          } else {
            return [matchingOrganisation];
          }
        });

        industriesFromSubject.mockImplementation((subject) => {
          if (subject === subject3) {
            return [nonMatchingIndustry];
          } else {
            return [matchingIndustry];
          }
        });

        regulationTypesFromSubject.mockImplementation((subject) => {
          if (subject === subject4) {
            return [nonMatchingRegulationType];
          } else {
            return [matchingRegulationType];
          }
        });

        nameFromSubject.mockImplementation((subject) => {
          if (subject === subject5) {
            return nonMatchingName;
          } else {
            return matchingName;
          }
        });

        expect(
          filterHelper.filter({
            keywords: matchingName,
            nations: [Nation.find(matchingNationCode)],
            organisations: [
              organisationFactory.build({ id: matchingOrganisation.id }),
            ],
            industries: [industryFactory.build({ id: matchingIndustry.id })],
            regulationTypes: [matchingRegulationType],
          }),
        ).toEqual([subject6]);
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

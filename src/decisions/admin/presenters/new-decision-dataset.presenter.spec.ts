import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { ProfessionsSelectPresenter } from '../../../professions/admin/presenters/professions-select.presenter';
import { RegulatedAuthoritiesSelectPresenter } from '../../../professions/admin/presenters/regulated-authorities-select-presenter';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import organisation from '../../../testutils/factories/organisation';
import profession from '../../../testutils/factories/profession';
import { NewTemplate } from '../interfaces/new-template.interface';
import { NewDecisionDatasetPresenter } from './new-decision-dataset.presenter';
import { YearsSelectPresenter } from './years-select.presenter';

jest.mock('../../../professions/admin/presenters/professions-select.presenter');
jest.mock(
  '../../../professions/admin/presenters/regulated-authorities-select-presenter',
);
jest.mock('./years-select.presenter');

const mockProfessionsSelectArgs: SelectItemArgs[] = [
  {
    text: 'Profession',
    value: 'profession',
    selected: false,
  },
];

const mockOrganisationsSelectArgs: SelectItemArgs[] = [
  {
    text: 'Organisation',
    value: 'organisation',
    selected: false,
  },
];

const mockYearsSelectArgs: SelectItemArgs[] = [
  {
    text: '2016',
    value: '2016',
    selected: false,
  },
];

describe('NewDecisionDatasetPresenter', () => {
  describe('present', () => {
    describe('when values have been selected', () => {
      it('returns a populated NewTemplate', () => {
        const professions = profession.buildList(5);
        const organisations = organisation.buildList(5);
        const startYear = 2016;
        const endYear = 2020;

        const selectedProfession = professions[3];
        const selectedOrganisation = organisations[2];
        const selectedYear = 2018;

        (
          ProfessionsSelectPresenter.prototype.selectArgs as jest.Mock
        ).mockReturnValue(mockProfessionsSelectArgs);
        (
          RegulatedAuthoritiesSelectPresenter.prototype.selectArgs as jest.Mock
        ).mockReturnValue(mockOrganisationsSelectArgs);
        (
          YearsSelectPresenter.prototype.selectArgs as jest.Mock
        ).mockReturnValue(mockYearsSelectArgs);

        const i18nService = createMockI18nService();

        const presenter = new NewDecisionDatasetPresenter(
          professions,
          organisations,
          startYear,
          endYear,
          selectedProfession,
          selectedOrganisation,
          selectedYear,
          i18nService,
        );

        expect(presenter.present()).toEqual<NewTemplate>({
          professionsSelectArgs: mockProfessionsSelectArgs,
          organisationsSelectArgs: mockOrganisationsSelectArgs,
          yearsSelectArgs: mockYearsSelectArgs,
        });

        expect(ProfessionsSelectPresenter).toHaveBeenCalledWith(
          professions,
          selectedProfession,
          i18nService,
        );
        expect(
          ProfessionsSelectPresenter.prototype.selectArgs,
        ).toHaveBeenCalled();

        expect(RegulatedAuthoritiesSelectPresenter).toHaveBeenCalledWith(
          organisations,
          selectedOrganisation,
          null,
          i18nService,
        );
        expect(
          RegulatedAuthoritiesSelectPresenter.prototype.selectArgs,
        ).toHaveBeenCalled();

        expect(YearsSelectPresenter).toHaveBeenCalledWith(
          startYear,
          endYear,
          selectedYear,
          i18nService,
        );
        expect(YearsSelectPresenter.prototype.selectArgs).toHaveBeenCalled();
      });
    });

    describe('when no values have been selected', () => {
      it('returns a populated NewTemplate', () => {
        const professions = profession.buildList(5);
        const organisations = organisation.buildList(5);
        const startYear = 2016;
        const endYear = 2020;

        (
          ProfessionsSelectPresenter.prototype.selectArgs as jest.Mock
        ).mockReturnValue(mockProfessionsSelectArgs);
        (
          RegulatedAuthoritiesSelectPresenter.prototype.selectArgs as jest.Mock
        ).mockReturnValue(mockOrganisationsSelectArgs);
        (
          YearsSelectPresenter.prototype.selectArgs as jest.Mock
        ).mockReturnValue(mockYearsSelectArgs);

        const i18nService = createMockI18nService();

        const presenter = new NewDecisionDatasetPresenter(
          professions,
          organisations,
          startYear,
          endYear,
          null,
          null,
          null,
          i18nService,
        );

        expect(presenter.present()).toEqual<NewTemplate>({
          professionsSelectArgs: mockProfessionsSelectArgs,
          organisationsSelectArgs: mockOrganisationsSelectArgs,
          yearsSelectArgs: mockYearsSelectArgs,
        });

        expect(ProfessionsSelectPresenter).toHaveBeenCalledWith(
          professions,
          null,
          i18nService,
        );
        expect(
          ProfessionsSelectPresenter.prototype.selectArgs,
        ).toHaveBeenCalled();

        expect(RegulatedAuthoritiesSelectPresenter).toHaveBeenCalledWith(
          organisations,
          null,
          null,
          i18nService,
        );
        expect(
          RegulatedAuthoritiesSelectPresenter.prototype.selectArgs,
        ).toHaveBeenCalled();

        expect(YearsSelectPresenter).toHaveBeenCalledWith(
          startYear,
          endYear,
          null,
          i18nService,
        );
        expect(YearsSelectPresenter.prototype.selectArgs).toHaveBeenCalled();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

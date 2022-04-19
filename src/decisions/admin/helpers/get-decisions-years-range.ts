const firstYearOfRecordedDecisionData = 2020;

export function getDecisionsYearsRange(): { start: number; end: number } {
  return {
    start: firstYearOfRecordedDecisionData,
    end: new Date().getFullYear() - 1,
  };
}

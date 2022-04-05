# 19. use_json_for_decision_data

Date: 2022-04-05

## Status

Accepted

## Context

For each profession within the service, regulators need to be able to upload
and download data reflecting how many applicants have been accepted or
rejected onto each profession. Within each profession, this data will be
split by regulator, year, and qualification route, and country. We will
generally only need to retrive data by profession, regulator and year.

## Decision

The decision data for each profession, regulator, and year, will be stored as
a JSON string. This JSON string will contain decision data for each route,
which then contains a list of decisions within that route for each country.

A database table with the following columns will store the JSON string:

- Profession ID
- Organisation ID
- Year
- Publication status
- JSON string representing decision data for each route
- Created timestamp
- Last updated timestamp
- User ID of user to last update this data

The JSON data will adhere to the following Typescript type:

```typescript
export type DecisionRoute = {
  name: string;
  countries: {
    country: string;
    decisions: {
      yes: number;
      no: number;
      yesAfterComp: number;
      noAfterComp: number;
    };
  }[];
}[];
```

## Consequences

Storing decision data as a JSON string allows us to manage this
multi-dimensional data without the need for complex joins across multiple
database tables. This does make the data less readily queryable (though this
may be somewhat mitigated by PostgreSQL's ability to query JSON data), but
writing migrations to store the data in a more queryable form is possible
later.

This does not reduce the type-safety of the service, as TypeORM ensures we
never directly work with un-parsed JSON strings.

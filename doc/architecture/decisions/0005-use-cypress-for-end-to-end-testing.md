# 5. Use Cypress for end-to-end testing

Date: 2021-11-16

## Status

Accepted

## Context

We want to be able to automate testing end-to-end user journeys through our
application. Cypress is an alternative to Selenium that runs in the browser to
do this for us, offering both headless and in-browser methods of running the
tests.

## Decision

We will use Cypress for end-to-end tests. Because of the overhead involved in
writing end-to-end tests, we'll opt for mostly testing happy paths in the
application and rely on unit and more focused integration tests for edge cases.

## Consequences

There will be some overhead in writing tests in Cypress, but this will ensure
we catch any regressions introduced by changes to the codebase.

There are some limitations to using Cypress as an integration framework,
particularly that it may not be possible to test situations in the browser
where JavaScript is disabled for any reason, which presents some difficulties
in trying to [build a resilient frontend using progressive
enhancement](https://www.gov.uk/service-manual/technology/using-progressive-enhancement#building-more-complex-services).

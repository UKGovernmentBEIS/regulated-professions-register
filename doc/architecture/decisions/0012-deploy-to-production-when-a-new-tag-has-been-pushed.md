# 12. deploy-to-production-when-a-new-tag-has-been-pushed

Date: 2021-12-21

## Status

Accepted

## Context

We now are deploying our code to GOV.UK PaaS (Platform as a Service), and we need to
agree how we trigger a deployment to production. We've never been happy with the
approach of `develop`/`main` branches, for staging and production, so we've decided
to try a new approach.

## Decision

Staging deploys will be triggered by push to `main`, while production deploys will be
triggered by the push of a new tag in the format `release-$X`, where `$X` is a release
number, padded to a length of three characters with zeroes.

There will be a deploy script, designed to run on a developer's machine, that will
automate the process of tagging a new release.

## Consequences

As `main` is now not a record of what is actually deployed, it may be trickier to
understand what is actually deployed. We will negate this risk by adding a CHANGELOG,
which will spell out exactly what is deployed against which tag, as well as what
is currently awaiting deployment.

The deployment script will also guard against this Changelog not being up to date,
by checking the new release is referenced in the CHANGELOG.

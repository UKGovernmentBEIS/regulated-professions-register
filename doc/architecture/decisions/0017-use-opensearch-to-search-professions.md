# 17. use-opensearch-to-search-professions

Date: 2022-03-17

## Status

Accepted

## Context

The current search on the public-facing side of the product does not always return satisfactory results. For example
a search for 'lawyer' will not return results for Solicitors.

All professions we have imported have an Office for National Statistics SOC (Standard Occupational Classification)
code assigned. As part of the import process, we've also imported all of the SOC index terms into a field called
`Keywords`, which will allow searches for alternative keywords to be possible.

## Decision

To allow searches for alternative keywords, we will implement an Opensearch service on the GOV.UK PaaS infrastructure.
When a profession is published, we will add the profession version's ID, name and keywords to the Opensearch index.
When a public user searches for a keyword, we will search the opensearch index for that keyword, and then filter the
database for profession versions that match that keyword.

## Consequences

This will involve some further infrastructure work in spinning up a new service. We also need to think further about
how we present SOC codes to users when adding a new profession - currently there is no way in the UI to add SOC codes
to a new profession, but given this is unlikely to be a common task, we think it will be OK to implement this at a
later date.

We should also think about whether it is worth implementing Opensearch on the admin side of the application, as we
use keywords when searching there too.

# 18. use_data_migrations

Date: 2022-03-28

## Status

Accepted

## Context

When making changes to the structure of the of the database, we need a way to make changes
to the data itself, so we don't lose information. It's bad practice to make these changes
in database migrations, as these are error prone and mean we the data structure and contents
are coupled too tightly together.

## Decision

Use data migrations to make changes to the data structure manually. We've added some scripts to
make the process clear and easy, and these tasks will have to me done manually once code
is deployed.

## Consequences

This is not an automatic process and developers will have to remember to do this manually after
an initial deploy. We mitigate this by being clear when data migrations have to be run, and
by only adding data migrations only when necessary.

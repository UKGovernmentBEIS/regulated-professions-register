# 6. Use TypeORM

Date: 2021-11-16

## Status

Accepted

## Context

An Object-Relational Mapping (ORM) library provides helpful methods for
interacting with a database, providing an abstraction layer above the database
itself. It's well-suited to writing software with an MVC
(Model-View-Controller) pattern, which we're following with NestJS. NestJS
provides out-of-the-box support for TypeORM via the `@nestjs/typeorm` package.

## Decision

We will use TypeORM as our ORM library, as it is written in TypeScript and
integrates well with the NestJS framework.

## Consequences

There may be some initial overhead in getting up to speed with the DSL for
TypeORM, but as TypeORM integrates well with NestJS, it will make interacting
with our database a lot easier for developers by doing a lot of the work for
us.

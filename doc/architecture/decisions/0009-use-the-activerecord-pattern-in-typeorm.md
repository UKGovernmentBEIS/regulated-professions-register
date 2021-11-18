# 9. Use the ActiveRecord Pattern in TypeORM

Date: 2021-11-18

## Status

Accepted

## Context

We have chosen TypeORM as our ORM library. It supports two popular
design patterns for interacting with databases - Datamapper and
ActiveRecord.

With Datamapper, all query methods are defined in separate classes
called "repositories", and saving, removing, and loading objects is
done using repositories.

With ActiveRecord, all query methods are defined in the model itself,
and you save, remove, and load objects using model methods.

## Decision

For this project, we have decided to adopt the ActiveRecord pattern.
This is because most of the developers currently on this project, and
developers who will be maintaining it, are used to this pattern from
working with Ruby on Rails. It is also a pattern that is familiar to
developers who have worked with frameworks such as Laravel (PHP), and
Django (Python).

As we are also particularly time pressured, ActiveRecord is a good
choice, as it's simpler to get up and running with, and requires
much less boilerplate code.

## Consequences

Not using Datamapper may have an impact on maintainability and
testability, because the code is much more tightly coupled to the
database, but given the size and complexity of the application,
this is a small risk. We can also balance against this risk by
introducing service objects, if the situation allows.

# 12. Enable many-to-many links between professions and regulators

Date: 2021-12-09

## Status

Accepted

## Context

Our data model should accurately represent our problem domain. We should not adopt the same
data structures as previous software by default, but instead try to represent the real world
more accurately.

We content that the current flat data model in use by the older EU system is limiting and
inaccurate. Instead we propose a richer data model that better reflects reality, specifically
around how professions and regulators relate to one another.

## Decision

We will represent the relation between organisations and professions not as a 1-to-1 relationship,
but many-to-many. A Profession will have many Regulations, which refer to the *state of being regulated*.

Regulations are valid within a certain geographical area, and within a certain time. A Regulation is owned
by one or many Organisations; in the case of a statutory regulation, this is likely to be just one per geographical area,
but in voluntary cases it could be many.

Qualification requirements and enacting legislation are information related to the Regulation relationship

![Organisations and professions data models](/doc/architecture/diagrams/organisations-and-professions/organisations-and-professions-0012.png)

This version supercedes the design presented in [ADR 9: Represent data structures in a relational database](0009-represent-data-structures-in-a-relational-database.md).

## Consequences

This data model can represent a single profession across multiple areas. For instance, our profession would be
"Primary School Teacher" rather than the existing "Primary School Teacher (Wales)".

This richer data structure supports higher data quality, and more accurate automatic analysis, by linking professions
across areas and time.

This model should be validated through user research, and will also need to feed into the service and
interaction design process.

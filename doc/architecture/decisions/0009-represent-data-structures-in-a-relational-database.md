# 9. Represent data structures in a relational database

Date: 2021-11-18

## Status

Accepted

## Context

Our application will need a mechanism for storing and retrieving data. The 2 key models in our application, Competent Authorities (CA) and Regulated Professions (RPs), have a one-to-many relationship, in addition to smaller nested fields on them that would be well-suited to a relational database structure.

## Decision

We will use generic naming for our internal data structures where possible to keep our schema flexible, based on standard naming taken from [schema.org](https://schema.org/). "Competent Authorities" can be mapped to an `Organisation`, while "Regulated Professions" can be mapped to a `Profession`. Using scraped data from the original EU professions register and based on data displayed to our users in the prototypes developed in Alpha, we have decided on the following data models and relational structure:

![Organisations and professions data models](/doc/architecture/diagrams/organisations-and-professions/organisations-and-professions-0009.png)

There are a few remaining fields from the scraped data that we've not mapped to the Profession model yet, notably:

- `method_obtain_qualifications`
- `path_obtain_qualifications`
- `duration_education`
- `mandatory_traineeship`
- `mandatory_registration_in_professional_bodies`
- `territorial_restrictions`
- `prof_indemnity_insurance_requirement`

These will be incorporated into our data model in future (see [Consequences](#consequences) for more information)

## Consequences

Having this starting data structure will allow us to begin building the functionality for allowing administrators to create new Organsations and Professions in the service, and for members of the public to view the relvant information from this starting set of fields.

This is by no means a finalised data structure, as we're aware of the key fields missing, as mentioned above.

We'll need to further explore these fields in user research and in discussions with the wider BEIS team to determine the best structure and use case for them.

### Questions / things to consider

- For professions in the same field, with the same nature of work that might belong to a different jurisdiction or region e.g Primary School Teacher - **Northern Ireland** and Primary School Teacher - **Scotland**, should we represent them as the same `Profession` internally but link them to their respective regions / organisations, or do we require them to be separate professions?
  - Does a profession belong to a single organisation, or can it belong to many?
  - If we do have a single profession that's linked to multiple organisations, we'll probably need to add a new `Jurisdiction`/`Region` join table to link them in future.
- The scraped data included Competent Authority IDs, Regulated Profession IDs and Industry IDs e.g. `CA1`, `RP1`, `IND1` - are these relevant to our application or are they only mapped to EU data structures?
- How should represent the change of data over time in our application? If an organisation changes its name, do we need to reflect the date its name changed, as well as any relevant legislation that may have been updated? Will previous/outdated qualifications still be relevant to a renamed or restructured organisation, for example, and how can we plan for this?
- The scraped EU data included two headers `si_type_of_regulation` and `type_of_regulation` - what is the difference between these fields, and do we need both?

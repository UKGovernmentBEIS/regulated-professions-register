# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [unreleased]

### Added

- Allow professions to have multiple organisations via a join table

### Changed

- Small revisions to sign in/out text to follow GOV.UK style guidelines

## [release-013] - 2022-03-29

### Added

- New internal guidance page

## [release-012] - 2022-03-29

### Added

- New landing page for central users

### Changed

- Telephone numbers are validated on input, and formatted as international numbers on display
- Remove BEIS contact telephone number, as BEIS won't be providing telephone support
- Consistent labels for legislation fields

## [release-011] - 2022-03-25

### Added

- Support for searching by regulation type in public-facing Profession and Organisation search
- Data disclaimer linked to from site footer

### Changed

- Use Opensearch for searching Organisations
- Backlink on public show pages takes the user back to the search results
- Updated second legislation label text to be clearer for admins
- Fix bug with organisations and professions not being displayed in alphabetical order
- Order users alphabetically
- Increase expiry time on invitation email links to 14 days
- Remove "double authentication" step from internal pages
- Allow a central user to create a draft Profession with only a name and an Organisation
- Validate that all necessary fields are completed before a Profession is published
- Validate that all associated Organisations are published before a Profession is published
- Telephone numbers are validated on input, and formatted as international numbers on display

## [release-010] - 2022-03-22

### Added

- Index profession versions in Opensearch when publishing
- Delete previously indexed profession versions from Opensearch when publishing
- Delete profession versions from Opensearch when archiving
- Search profession titles using Opensearch
- Allow central users to filter Profession and Organisation listings by regulation type
- Search profession keywords using Opensearch
- Add a script to reindex professions in Opensearch
- Add button for clearing all filters on public and internal pages

### Changed

- Improve constraints around editing users
- Improve constraints around editing organisations
- Improve constraints around editing professions
- Display number of results above filters on mobile
- Hide filters on mobile once users have searched
- Only allow users to edit a Profession if they are a central user, or in that Profession's primary Organisation

## [release-009] - 2022-03-11

### Added

- Add accessibility statement

### Changed

- Fix wrong links on dashboard
- Sort professions alphabetically in search results
- Remove unimplemented "changed by" filter from internal filters

## [release-008] - 2022-03-11

### Added

- Allow users to publish professions and organisations when editing
- Add link to feedback form for internal and public users
- Add cookie and privacy policies
- Allow editors to enter a regulation type for a Profession

### Changed

- Display a second Regulatory Authority if specified for a profession
- Inpsect a second Regulatory Authority when searching, if specified for a profession
- Change visible columns in internal Professions listing
- Audit optional fields and ensure correct messaging is used
- Move registration section further down the edit page to encourage more detail elsewhere
- Improve sidebar in the internal Organisation and Profession views
- Hide empty fields in public Organisation and Profession views
- Replace UKCPQ text with BEIS organisation name
- Show user's name rather than username in welcome message
- Display additional UK qualification data where the Profession itself is not a whole-UK Profession
- Remove non-UK qualification data
- Show user's organisation on dashboard
- Internal Orgnaisation listing can be filtered by nation
- Reorganise sector list and add missing sectors
- Change the sidenav to a topnav
- Update dashboard content
- Update content on the public facing start page
- Display Profession registration data
- Make consistent the formatting of lists of Organisations, nations, and sectors
- Ensure missing data doesn't break public pages, if it somehow slips through
- Display regulation type on internal and public Profession pages

## [release-007] - 2022-03-04

### Changed

- Fix bug where industries weren't being shown in the Admin Organisations index page
- Don't display unconfirmed organisations in selects or filters
- Remove Mandatory Registration field and radio buttons
- Remove redundant fields and form inputs from Qualifications

## [release-006] - 2022-03-02

### Added

- Allow organisations to be archived
- Allow professions to be archived

### Changed

- Remove placeholder nav subsection on public-facing homepage
- Improve URL validation and presentation
- Improve email address validation
- Fixed Regulatory Authorities showing in internal listing before being saved as draft or published
- Remove "Contact URL" from Regulator Authority editing page

## [release-005] - 2022-02-24

### Added

- Add "more information url" to Qualification detail entry page
- Display message in search results when no professions match filter criteria
- Add a confirmation page before publishing an organisation or a profession
- Display name of entity being edited (profession or organisation) when editing for context
- Display name of currently-edited user in page header when adding or editing a user

### Changed

- Replace routes to obtain Qualification & most common path to obtain radio buttons with textareas
- Remove Qualification Level from admin organisation list
- Remove deprecated fields from Qualification
- Move Sectors filter above the Nations filter
- Allow admin users to edit blank Qualifications when no values have been set from a data import
- Remove confirmation screens when creating new entities
- Update labels and hint text for admin profession screens

## [release-004] - 2022-02-21

### Added

- Add Plausible.io analytics
- Add SOC code and keyword fields to Professions to be

### Changed

- Users can enter a second legislation for a profession
- Display user who changed a profession on the Admin Profession index page and Profession page itself.
- Display name of user who last edited an organisation and modified date to admins
- Allow BEIS team users to see the "Changed By" field so they can track who has edited data.
- Change edit button wording depending on entity status
- Show a confirmation banner when publishing entities
- Change order of data entry when creating a profession, so name and organisation(s) are inputted first
- Only service administrators and registrars may edit the top-level information of a profession
- Replace paragraph tags with captions in tables
- Stop tables overflowing when zoomed in

## [release-003] - 2022-02-16

### Added

- Allow a draft version to be published
- Allow draft Professions to be published
- Protected titles and and a URL for further information on regulations can be entered when adding a profession
- Allow second regulator to be chosen
- Add registration page and fields
- Add extra qualification recognition fields

### Changed

- Creating and editing an organisation creates new draft versions
- Creating and editing a profession creates new draft versions
- Users can be assigned to an organisation
- Users are assigned a role rather than a list of permissions
- All roles may edit professions
- Only service admistrators may create professions
- Setting an organisation on a profession updates immediately, rather than saving as draft
- Remove redundant fields from Profession, now the values are stored on a Version
- Simplify nation selection
- Remove placeholder authority data on index page
- Revised text describing each role to reflect role differences between regulatory authority users and central users
- Enforce that users cannot perform actions outside their role
- Preserve line breaks of any data entered in a multi-line text field
- Fix incorrect "Publish now" button that should be saving as draft

## [release-002] - 2022-02-01

### Added

- Add more granular database fields for storing the duration of a qualification
- Add a service owner boolean to a user
- Define new user permissions
- List Regulatory Authorities
- Add page for adding a new qualification to a profession
- Show Regulatory Authorities to an admin
- Add page for setting legislation information on a profession
- Add a public-facing Regulatory Authorities search page that allows for filtering professions by keywords, nations, and industries
- Allow Regulatory Authorities to be edited
- Update start page
- Add public-facing Regulatory Authority pages
- Allow Professions to be edited
- Display real data on "view profession" pages
- Add back link from internal professions page to index page
- Add filters to internal Regulatory Authorities page

### Changed

- No longer display previous values on a profession when rendering form errors
- Use enums for storing methods to obtain and common paths to obtain a qualification
- Require users to be logged in to be able to add a profession
- Change roles to permissions
- Update entities on seed, rather than replacing them
- Take users from internal organisations page to internal profession page via link, rather than to public-facing page
- Move back link to under phase banner
- Fix obvious accessibility issues

## [release-001] - 2022-01-10

### Added

- A professions search page that allows for filtering professions by keywords, nations, and industries
- A landing page for public and admin users
- Send confirmation email to users once created
- Add Bull to run background tasks
- New screen for selecting a regulatory authority when creating a new profession
- Seed users at deploy time
- New screen for inputting reserved activities and a description of the regulation when creating a new profession
- Add functional backlinks to Add a profession journey
- Delete a user in Auth0 when deleted in the app
- A professions listing page for logged-in users

### Changed

- Create draft Professions in the database, rather than using session storage when adding a new profession
- Fix bug where submitting invalid top level details on a new Profession caused the page to hang
- Add functionality to "change" links on Check your answers when creating a new Profession
- Update Regulated Activities to represent free text, rather than a list of items
- Fix links in error messages when adding a new profession
- Make validation errors more human readable

[unreleased]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-013...HEAD
[release-013]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release012...release-013
[release-012]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release011...release-012
[release-011]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release010...release-011
[release-010]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release009...release-010
[release-009]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release008...release-009
[release-008]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release007...release-008
[release-007]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release006...release-007
[release-006]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release005...release-006
[release-005]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release004...release-005
[release-004]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release003...release-004
[release-003]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release002...release-003
[release-002]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release001...release-002
[release-001]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release...release-001

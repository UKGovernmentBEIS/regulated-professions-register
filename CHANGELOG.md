# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [unreleased] - TBD

### Added

- Add new decision data field for "Not accepted - other conditions not met"

### Changed

- Prevent duplication of live versions of organisation when editing

## [release-030] - 22/06/2023

### Added

### Changed

- Update reference to BEIS in subject line of invite email

## [release-029] - 2023-06-13

### Added

- Add link to Licence Finder to home page

### Changed

- Update references to BEIS to DBT in confirmation, accessibility, and i18n
- Update privacy notice
- Re-enable decision data for non-service owner roles in production
- Change licence finder text wording
- Change link wording on home page

## [release-028] - 2023-05-11

### Added

- Add link to Licence Finder to professions page

### Changed

- Changed "Alternate name" to "Alternative name"
- New CDN route resource added to deployment

## [release-027] - 2023-05-03

### Added

- Add route resource to redirect root domain

### Changed

## [release-026] - 2023-04-11

### Added

- Add link to regulation types page
- Add disclaimer snippet to search pages

### Changed

- Change node image to alpine variant
- Update deployment to take custom domain from repository variable
- Re-enable decision data for service owner roles in production
- Update disclaimer text to use "Department for Business and Trade"
- Update deployment to create redirection app to redirect traffic from beis.gov.uk to service.gov.uk

## [release-025] - 2022-06-08

### Added

- Allow admins to unarchive an archived organisation

### Changed

- Left align the decision data download button
- Use a multi-line text input for profession registration requirements
- Enforce length limits on all input fields
- Add validation to prevent empty and duplicate countries when entering decision data
- Prevent Plausible from making requests on 404 pages
- Fix incorrect back link destination on regulatory authority editing page

## [release-024] - 2022-05-30

### Added

- Central users can sort the professions listing

### Changed

- Fix already-published professions and regulatory authorities being referred to as "new" when an updated version is published
- When showing a list of reasons why a profession cannot be published, show any not-published associated regulators first
- Fix back links around creating and editing users
- Correct text on error pages
- Fix legislations on professions with multiple legislations sometimes being displayed out of order

## [release-023] - 2022-05-19

### Added

- Add page explaining regulation types, with a link from the regulation types filter in the public searches
- Add link for technical feedback on the start page
- Allow regulators to filter decicion datasets by profession

### Changed

- Allow draft professions to be assigned to draft regulatory authorities
- Internal guidance pages require user to be logged in to view
- Move public search result count further up screen for screen readers
- Use production session store
- Regulators for professions now show on new lines if there is more than one in the admin professions view
- In public search, show drop shadows within scrollable filter selections to indicate further content

## [release-022] - 2022-05-17

### Added

- Link from Decisions Dashboard to guidance on decision outcomes and route

### Changed

- Update disclaimer text
- Archiving a profession no longer creates a draft
- Archived professions no longer prevent an organisation from being archived
- Consistent styling on links across service
- Improve text on internal links to public pages
- Change "View" buttons to "View details" links on user listing page
- Prevent organisation's nation from erroneously being shown as 'N/A'
- A new user with the same email address as a previously archived user can be created
- Archived users can no longer login to the service if Auth0 account deletion fails

## [release-021] - 2022-05-11

### Added

- Public view of decision data, linked to from public profession pages
- Add confirmation page when editing decision data
- Validations to ensure no duplicate or empty routes are entered in Decision data
- Link to recognition decisions dashboard from admin dashboard and navigation bar
- Add backlink from decision data edit page to the edit confirmation page

### Changed

- Exported CSV files now include both the country name and the country code
- When editing decision data, any partially completed rows will have blank rows set to zero
- Fix width of table columns when displaying and editing decision data
- Fix column headings when editing decision data
- Small revisions to text on decisions dashboard
- Revision on text on admin start page to include details of authenticator apps
- Improve hint text on keyword searches
- Hide recognition decision links in production environment
- Improve text around decision data filters
- Improve validation copy for decision data pages

## [release-020] - 2022-05-05

### Added

- Add confirmation page when publishing decision data from the editing page
- Add single decision dataset download link to internal dataset pages
- Public view of decision data, linked to from public profession pages

### Changed

- Allow organisation users to submit decision data directly from the editing page
- Track search parameters and outbound links in Plausible

## [release-019] - 2022-05-04

### Changed

- Increase timeout on invitation emails to 30 days
- Update feedback form links from Google to MS Forms

## [release-018] - 2022-05-03

### Added

- "Total" column on internal decision data tables
- Add bulk decision data download link
- Display confirmation banner when saving or publishing decision data
- Filters on decision data dashboard, applying to displayed data and exported CSV data
- "Submitted" status for decision datasets to make it clear that they're ready for publishing
- Add sidebar to admin decision data page

### Changed

- Only allow central admin users to publish decision data
- Allow decision data to be published without having to edit the data

## [release-017] - 2022-04-25

### Changed

- Prevent Organisation from being archived if they have related Professions - Regulator must have Professions removed before it can be archived
- Correct missing error copy when clicking CTA whilst amending a profession without selecting regulator name **and** regulator role
- Allow Professions to have up to 25 regulators (previously 5)
- Show full list of countries when editing/adding decision data
- Fix bug where publish button could still be clicked despite being disabled
- Fix bug where duplicate regulators were being displayed publicly

### Added

- Hide edit and delete buttons for non Tier 1 users
- Placeholder page for editing decision data
- Placeholder page for adding decision data
- Add Regulator column to decision data table for central admin users

# Changed

- Decision data can be submitted for any regulatory authority that regulates a profession in any role

## [release-016] - 2022-04-11

### Changed

- Show organisations grouped by their role on the profession view page

### Added

- Placeholder dashboard for viewing recognition decision data
- Placeholder page for showing a single decision dataset
- Show Awarding Bodies against profession
- Show Enforcement Bodies against profession

### Changed

- Allow users who are Editors and above to access and upload decision data

## [release-015] - 2022-04-06

### Added

- Allow multiple regulators to be added to a profession
- Display nations below organisations in search results
- Data model for representing recognition decision data
- Add back other countries routes to recognition with new radio buttons

### Changed

- Read from and write to the new organisation - profession relation
- Fix a bug causing Professions belonging to multiple Organisations to be uneditable by all but central users
- Consistently display "United Kingdom" where we would otherwise display a list of all four UK nations
- Fix bug causing selecting more nations in our search filters to give fewer results
- Split display of qualification data into overview, UK, and other countries sections

## [release-014] - 2022-03-30

### Added

- Allow professions to have multiple organisations via a join table

### Changed

- Small revisions to sign in/out text to follow GOV.UK style guidelines
- Use UK spelling of "authorised" on error page
- Remove use of all-caps text in headings

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

## Added

- Allow professions to have multiple organisations via a join table

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

[unreleased]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-030...HEAD
[release-030]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-029...release-030
[release-029]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-028...release-029
[release-028]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-027...release-028
[release-027]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-026...release-027
[release-026]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-025...release-026
[release-025]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-024...release-025
[release-024]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release023...release-024
[release-023]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release022...release-023
[release-022]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release021...release-022
[release-021]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release020...release-021
[release-020]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release019...release-020
[release-019]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release018...release-019
[release-018]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release017...release-018
[release-017]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release016...release-017
[release-016]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release015...release-016
[release-015]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release014...release-015
[release-014]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release013...release-014
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

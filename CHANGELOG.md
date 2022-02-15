# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- Allow a draft version to be published
- Allow draft Professions to be published
- Protected titles and and a URL for further information on regulations can be entered when adding a profession
- Allow second regulator to be chosen

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

[unreleased]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-001...HEAD
[release-002]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release001...release-002
[release-001]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release...release-001

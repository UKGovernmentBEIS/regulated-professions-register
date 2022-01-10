# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

### Changed

- Create draft Professions in the database, rather than using session storage when adding a new profession
- Fix bug where submitting invalid top level details on a new Profession caused the page to hang
- Add functionality to "change" links on Check your answers when creating a new Profession
- Update Regulated Activities to represent free text, rather than a list of items
- Fix links in error messages when adding a new profession
- Make validation errors more human readable

## [Unreleased]

[unreleased]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-001...HEAD
[release-001]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release...release-001

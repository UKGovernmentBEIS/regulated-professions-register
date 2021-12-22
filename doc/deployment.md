# Deployment process

## Production

Production deploys are triggered by the push of a new tag in the format `release-$X`,
where `$X` is a release number, padded to a length of three characters with zeroes.

To give us a slightly more formal process around what gets deployed and when and also to
give us visibility into the things that have been deployed, we additionally follow these
steps when releasing to production:

Releases are documented in the [CHANGELOG](../CHANGELOG.md) following the [Keep a changelog](https://keepachangelog.com/en/1.0.0/) format.

When a new release is deployed to production, a new second-level heading should be created in CHANGELOG.md with the release number and details of what has changed in this release.

The heading should link to a Github URL at the bottom of the file, which shows the differences between the current release and the previous one. For example:

### Example

```
## [release-1]
- A change
- Another change

[release-1]: https://github.com/UKGovernmentBEIS/regulated-professions-register/compare/release-1...release-0
```

### Steps

1. Create a release branch and make a pull request
   - Create a branch from main for the release called release-X where X is the release number
   - Update CHANGELOG.md to:
     document the changes in this release in a bullet point form
     add a link to the diff at the bottom of the file
   - Document the changes in the commit message as well
   - Push the changes up to Github `git push -u origin release-x`
   - Create a pull request to merge that release into main with content from the CHANGELOG.md
   - Get that pull request reviewed and approved
1. Review and merge the release pull request
   The pull request should be reviewed to confirm that the changes in the release are safe to ship and that CHANGELOG.md accurately reflects the changes included in the release.
1. Confirm the release candidate and perform any prerequisites
   - Confirm the release with any relevant people (product owner, delivery manager, etc)
   - Think about any dependencies that also need considering: dependent parts of the service that also need updating; environment variables that need changing/adding; third-party services that need to be set up/updated; data migrations to be run
1. Update your local main branch and run the `script/release` command
1. Production smoke test
   Once the code has been deployed to production, carry out a quick smoke test to confirm that the changes have been successfully deployed.
1. Move all the Azure DevOps cards from "Awaiting deployment" to "Done"

## Staging

Staging deploys are run automatically on a push to the `main` branch. To deploy
to staging, follow the following steps:

1. Open a pull request back into the `main` branch with your changes
1. Get that pull request code reviewed and approved
1. Check that any prerequisite changes to things like environment variables or third-party service configuration is ready
1. Merge the pull request

The changes should be automatically applied by Github Actions. [You can track the progress of Github Actions jobs at this link](https://github.com/UKGovernmentBEIS/regulated-professions-register/actions/workflows/deploy.yml).

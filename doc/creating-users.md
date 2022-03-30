# Creating users

Users can be created from the service's admin interface.

When creating a new user, you'll need to select an organisation:

## User types

### Regulated Professions Register

This account has access to view, edit and create organisations, as well as users and professions belonging to any organisation, depending on the level of access given.

### A regulatory authority

This account only has access to view, edit and create Users and Professions belonging to their own Organisation, as well as their own Organisation's details, depending on permissions given to the user account.

## Seeded users

Users are seeded for each environment. The user accounts available are listed in the relevant json file in the [seeds directory](../seeds/), e.g. [development users](../seeds/development/users.json). Credentials for each user are stored in 1Password.

## Auth0

User management is currently handled in Auth0 for development, staging and production environments. You probably won't need to access this, as most of the functionality is already built into the service e.g. creating & editing users.

If you do need to access this, you'll need to be given access by members of the project team.

You can access the Auth0 UI here:

### Development (used for logging in locally on your personal machine)

https://manage.auth0.com/dashboard/eu/beis-rpr-development/

### Staging

https://manage.auth0.com/dashboard/eu/beis-rpr-prod/

### Production

https://manage.auth0.com/dashboard/eu/beis-rpr-prod/

# 11. Use Auth0 for authentication

Date: 2021-11-23

## Status

Accepted

## Context

We need to allow a number of users to sign in to the service in order to use it. In order to implement this quickly, we'll use Auth0 to manage this.

## Decision

We will use the free tier of Auth0 to manage user login

## Consequences

As Auth0's authentication uses OAuth2, it should be straightforward to migrate to another service, if BEIS have a preference for something else.

However, as we will be using the Auth0 API to create users in our
application, we will have to change this if we do migrate, but this
is a relatively change, as most modern SaaS authentication providers
offer this functionality.

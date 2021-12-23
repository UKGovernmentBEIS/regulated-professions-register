# 13. use-bull-and-redis-to-send-emails

Date: 2021-12-23

## Status

Accepted

## Context

The service needs to send invitation emails through Notify. The service will likely need to
send more notifications in future to send reminders or notify of approvals etc.

[Bull](https://github.com/OptimalBits/bull) is a well-supported service to queue and
process background jobs. NestJS
[provides a package](https://docs.nestjs.com/techniques/queues) which is an abstraction
layer on top of Bull, allowing us to integrate queues in a Nest-friendly way.

## Decision

Use Bull to send emails and other asynchronous tasks.

Use Redis as the queue for jobs to improve fault resilience.

## Consequences

We will need a new Redis dependency in our infrastructure. This is a short term cost but
will enable other future jobs to be added easily. We will also need Redis for session
storage as we move closer to the service becoming live.

Sending emails asynchronously will provide some fault tolerence if Notify is unavailable or
if there are any other connectivity issues.

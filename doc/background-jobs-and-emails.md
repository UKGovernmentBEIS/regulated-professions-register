# Background jobs and emails

We use [Bull](https://docs.nestjs.com/techniques/queues) to handle background tasks that
may take a long time, or need some fault tolerace.

Currently we use it mainly for sending messages via Notify, but this may change in future
as the service evolves.

## Adding a new email

We use the concept of "mailers" to send emails. These accept arguments that come from the
controller. We then build up the content of the email from a Nunjucks template, and set the
title and recipient address. A mailer could look like this:

```typescript
@Injectable()
export class MyMailer {
  constructor(@InjectQueue('default') private queue: Queue) {}

  async email(user: User) {
    const email = user.email;
    const subject = 'Hello World';
    const templateID = process.env['NOTIFY_TEMPLATE_ID'];
    const body = nunjucks.render(
      path.resolve(__dirname, '../../views/mailers/hello.njk'),
      {
        name: user.name,
      },
    );

    // Send the email message to the `mailer` queue
    await this.queue.add('mailer', {
      email: email,
      templateID: templateID,
      personalisation: {
        subject: subject,
        body: body,
      },
    });
  }
}
```

To enqueue this mailer, we would call the following (assuming `myMailer` is an instance of
`MyMailer` injected into a Controller or Service):

```typescript
this.myMailer.email(user);
```

When a mailer is added to the queue, it it picked up by the
[MailerConsumer](https://github.com/UKGovernmentBEIS/regulated-professions-register/blob/main/src/common/mailer.consumer.ts) class,
which takes anything put in the `mailer` queue and makes an API call to GOV.UK Notify.

We use a default template in GOV.UK Notify, which has a placeholder for the whole body
and subject line. This allows us to keep our email body tightly coupled to the code, and
version-controlled.

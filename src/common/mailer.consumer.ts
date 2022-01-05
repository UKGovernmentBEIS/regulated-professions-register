import { Processor, Process } from '@nestjs/bull';
import { EmailMessage } from './interfaces/email-message';
import { NotifyClient } from 'notifications-node-client';
import Rollbar from 'rollbar';

@Processor('default')
export class MailerConsumer {
  @Process('mailer')
  async send(message: EmailMessage): Promise<void> {
    const client = this.getClient();
    const rollbarClient = this.getRollbarClient();

    try {
      await client.sendEmail(message.data.templateID, message.data.email, {
        personalisation: message.data.personalisation,
        reference: null,
      });
    } catch (err) {
      rollbarClient.error(
        err,
        {},
        { templateID: message.data.templateID, email: message.data.email },
      );
      Promise.resolve();
      throw err;
    }
  }

  private getClient(): NotifyClient {
    return new NotifyClient(process.env['NOTIFY_API_KEY']);
  }

  private getRollbarClient(): Rollbar {
    return new Rollbar({
      accessToken: process.env['ROLLBAR_TOKEN'],
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        environment: process.env['ENVIRONMENT'],
      },
    });
  }
}

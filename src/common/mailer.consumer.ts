import { Processor, Process } from '@nestjs/bull';
import { EmailMessage } from './interfaces/email-message';
import { NotifyClient } from 'notifications-node-client';

@Processor('default')
export class MailerConsumer {
  @Process('mailer')
  async send(message: EmailMessage): Promise<void> {
    const client = this.getClient();

    await client.sendEmail(message.data.templateID, message.data.email, {
      personalisation: message.data.personalisation,
      reference: null,
    });
  }

  private getClient(): NotifyClient {
    return new NotifyClient(process.env['NOTIFY_API_KEY']);
  }
}

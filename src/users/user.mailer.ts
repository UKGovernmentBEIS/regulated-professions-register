import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import nunjucks from 'nunjucks';
import path from 'path';

import { User } from './user.entity';

@Injectable()
export class UserMailer {
  constructor(@InjectQueue('default') private queue: Queue) {}

  async confirmation(user: User, link: string) {
    const email = user.email;
    const subject =
      'Invitation to the BEIS regulated professions register service';
    const templateID = process.env['NOTIFY_TEMPLATE_ID'];
    const body = nunjucks.render(
      path.resolve(__dirname, '../../views/mailers/confirmation.njk'),
      {
        name: user.name,
        confirmationLink: link,
      },
    );

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

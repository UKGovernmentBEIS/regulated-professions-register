import { MailerConsumer } from './mailer.consumer';
import { NotifyClient } from 'notifications-node-client';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('MailerConsumer', () => {
  let notifyClient: DeepMocked<NotifyClient>;
  let mailerConsumer: MailerConsumer;

  beforeEach(() => {
    notifyClient = createMock<NotifyClient>({
      sendEmail: jest.fn(() => {
        return {};
      }),
    });
    mailerConsumer = new MailerConsumer();

    const getClient = jest.spyOn(MailerConsumer.prototype as any, 'getClient');
    getClient.mockImplementation(() => {
      return notifyClient;
    });
  });

  it('sends an email via NotifyClient', () => {
    mailerConsumer.send({
      data: {
        templateID: '1234',
        email: 'email@example.com',
        personalisation: {
          subject: 'foo',
          body: 'bar',
        },
      },
    });

    expect(notifyClient.sendEmail).toHaveBeenCalledWith(
      '1234',
      'email@example.com',
      {
        personalisation: {
          subject: 'foo',
          body: 'bar',
        },
        reference: null,
      },
    );
  });
});

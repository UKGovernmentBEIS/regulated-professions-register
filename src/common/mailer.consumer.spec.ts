import { MailerConsumer } from './mailer.consumer';
import { NotifyClient } from 'notifications-node-client';
import Rollbar from 'rollbar';

import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('MailerConsumer', () => {
  let notifyClient: DeepMocked<NotifyClient>;
  let rollbarClient: DeepMocked<Rollbar>;

  let mailerConsumer: MailerConsumer;

  beforeEach(() => {
    notifyClient = createMock<NotifyClient>({
      sendEmail: jest.fn(() => {
        return {};
      }),
    });
    rollbarClient = createMock<Rollbar>({
      error: jest.fn(() => {
        return {};
      }),
    });
    mailerConsumer = new MailerConsumer();

    const getClient = jest.spyOn(MailerConsumer.prototype as any, 'getClient');
    const getRollbarClient = jest.spyOn(
      MailerConsumer.prototype as any,
      'getRollbarClient',
    );

    getClient.mockImplementation(() => {
      return notifyClient;
    });
    getRollbarClient.mockImplementation(() => {
      return rollbarClient;
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

  it('sends an error to rollbar if it fails', async () => {
    notifyClient.sendEmail.mockImplementation(() => {
      throw new Error();
    });

    await expect(async () => {
      await mailerConsumer.send({
        data: {
          templateID: '1234',
          email: 'email@example.com',
          personalisation: {
            subject: 'foo',
            body: 'bar',
          },
        },
      });
    }).rejects.toThrowError();

    expect(rollbarClient.error).toHaveBeenCalledWith(
      expect.any(Error),
      {},
      { templateID: '1234', email: 'email@example.com' },
    );
  });
});

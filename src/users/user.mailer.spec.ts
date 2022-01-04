import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';

import { UserMailer } from './user.mailer';
import { User } from './user.entity';

const user = new User('email@example.com', 'name', '212121');

describe('UserMailer', () => {
  let service: UserMailer;
  let queue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMailer,
        {
          provide: getQueueToken('default'),
          useValue: {
            add: jest.fn(() => {
              return {};
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UserMailer>(UserMailer);
    queue = module.get<Queue>(getQueueToken('default'));
  });

  it('queues an email to be sent', async () => {
    await service.confirmation(user, 'http://example.com');

    expect(queue.add).toHaveBeenCalledWith('mailer', {
      email: user.email,
      templateID: process.env['NOTIFY_TEMPLATE_ID'],
      personalisation: {
        subject:
          'Invitation to the BEIS regulated professions register service',
        body: expect.stringMatching('http://example.com'),
      },
    });
  });
});

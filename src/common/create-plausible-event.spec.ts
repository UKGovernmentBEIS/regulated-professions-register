import axios from 'axios';
import { createPlausibleEvent } from './create-plausible-event';

jest.mock('axios');

describe('createPlausibleEvent', () => {
  it('should send a HTTP request to Plausible', async () => {
    process.env['HOST_URL'] = 'http://example.com/';

    createPlausibleEvent('event', 'some/path');

    expect(axios.post).toHaveBeenCalledWith(
      'https://plausible.io/api/event',
      {
        name: 'event',
        url: 'http://example.com/some/path',
        domain: 'example.com',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });
});

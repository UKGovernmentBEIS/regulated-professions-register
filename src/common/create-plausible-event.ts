import axios from 'axios';
import { getDomain } from '../helpers/get-domain.helper';

export async function createPlausibleEvent(
  name: string,
  path: string,
): Promise<void> {
  const domain = getDomain(process.env['HOST_URL']);
  const url = [process.env['HOST_URL'], path].join('');

  await axios.post(
    'https://plausible.io/api/event',
    {
      name: name,
      url: url,
      domain: domain,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

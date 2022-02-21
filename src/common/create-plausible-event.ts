import axios from 'axios';

export async function createPlausibleEvent(
  name: string,
  path: string,
): Promise<void> {
  const domain = process.env['HOST_URL']
    .replace(/https?:\/\//, '')
    .split('/')[0];
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

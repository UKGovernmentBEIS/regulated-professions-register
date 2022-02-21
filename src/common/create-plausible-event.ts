import axios from 'axios';

export async function createPlausibleEvent(
  name: string,
  path: string,
): Promise<void> {
  const domain = process.env['HOST_URL']
    .replace(/https?:\/\//, '')
    .split('/')[0];
  await axios.post('https://plausible.io/api/event', {
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      name: name,
      url: [process.env['HOST_URL'], path].join(''),
      domain: domain,
    },
  });
}

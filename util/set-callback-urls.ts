/*
 * This is a script that gets run after a successful deploy of a Heroku
 * review app to register the callback URLs on Auth0 to allow logins to
 * work properly on Heroku review apps.
 */

import { ManagementClient } from 'auth0';
import axios from 'axios';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const callbackUrls = async (): Promise<string[]> => {
  interface App {
    pr_number: string;
  }

  const response = await axios
    .get<App[]>(
      `https://api.heroku.com/pipelines/${process.env['HEROKU_PIPELINE_ID']}/review-apps`,
      {
        headers: {
          Accept: 'application/vnd.heroku+json; version=3',
          Authorization: `Bearer ${process.env['HEROKU_ACCESS_TOKEN']}`,
        },
      },
    )
    .then((res) => {
      return res.data;
    });

  return response.map((app: App) => {
    return `https://rpr-review-app-pr-${app.pr_number}.herokuapp.com/callback`;
  });
};

(async () => {
  const auth0 = new ManagementClient({
    domain: process.env['AUTH0_HOSTNAME'],
    clientId: process.env['AUTH0_CLIENT_ID'],
    clientSecret: process.env['AUTH0_CLIENT_SECRET'],
  });
  const urls = await callbackUrls();

  console.log(
    'Registering callback URLs for the currently installed Heroku review apps...',
  );

  auth0.updateClient(
    { client_id: process.env['AUTH0_CLIENT_ID'] },
    {
      callbacks: [...urls, 'http://localhost:3000/callback'],
    },
    function (err: Error) {
      if (err) {
        console.log(
          `Registration failed with the following error: '${err.message}''`,
        );
      } else {
        console.log('Success!');
      }
    },
  );
})();

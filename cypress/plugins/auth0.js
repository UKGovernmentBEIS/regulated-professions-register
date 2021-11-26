/* eslint-disable @typescript-eslint/no-var-requires */

const puppeteer = require('puppeteer');

const preventApplicationRedirect = function (callbackUrl) {
  return (request) => {
    const url = request.url();
    if (request.isNavigationRequest() && url.indexOf(callbackUrl) === 0)
      request.respond({ body: url, status: 200 });
    else request.continue();
  };
};

const writeUsername = async function writeUsername({ page, options } = {}) {
  await page.waitForSelector('#username');
  await page.type('#username', options.username);
};

const writePassword = async function writeUsername({ page, options } = {}) {
  await page.waitForSelector('#password', { visible: true });
  await page.type('#password', options.password);
};

const clickLogin = async function ({ page } = {}) {
  await page.waitForSelector('button[type="submit"]', {
    visible: true,
    timeout: 5000,
  });

  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]'),
  ]);
  return response;
};

exports.Login = async function (options = {}) {
  const browser = await puppeteer.launch({
    headless: options.headless,
    args: options.args || ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.setRequestInterception(true);

    page.on('request', preventApplicationRedirect(options.callbackUrl));

    await page.goto(options.loginUrl);

    await writeUsername({ page, options });
    await writePassword({ page, options });

    const response = await clickLogin({ page, options });

    if (response.status() >= 400) {
      throw new Error(
        `'Login with user ${
          options.username
        } failed, error ${response.status()}`,
      );
    }

    const url = response.url();
    if (url.indexOf(options.callbackUrl) !== 0) {
      throw new Error(`User was redirected to unexpected location: ${url}`);
    }

    const { cookies } = await page._client.send('Network.getAllCookies', {});
    return {
      callbackUrl: url,
      cookies,
    };
  } finally {
    await page.close();
    await browser.close();
  }
};

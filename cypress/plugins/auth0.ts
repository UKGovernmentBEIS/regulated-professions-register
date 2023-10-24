import puppeteer from 'puppeteer';

const preventApplicationRedirect = (callbackUrl: string) => {
  return (request: puppeteer.HTTPRequest) => {
    const url = request.url();
    if (request.isNavigationRequest() && url.indexOf(callbackUrl) === 0)
      request.respond({ body: url, status: 200 });
    else request.continue();
  };
};

const writeUsername = async ({
  page,
  options,
}: {
  page: puppeteer.Page;
  options: any;
}) => {
  await page.waitForSelector('#username');
  await page.type('#username', options.username);
};

const writePassword = async ({
  page,
  options,
}: {
  page: puppeteer.Page;
  options: any;
}) => {
  await page.waitForSelector('#password', { visible: true });
  await page.type('#password', options.password);
};

const clickLogin = async ({ page }: { page: puppeteer.Page }) => {
  await page.waitForSelector('div:not([aria-hidden]) > button[type="submit"]', {
    visible: true,
    timeout: 5000,
  });

  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('div:not([aria-hidden]) > button[type="submit"]'),
  ]);
  return response;
};

const login = async (options: any) => {
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

    const response = await clickLogin({ page });

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
    const client = await page.target().createCDPSession();
    const { cookies } = await client.send('Network.getAllCookies');
    return {
      callbackUrl: url,
      cookies,
    };
  } finally {
    await page.close();
    await browser.close();
  }
};

export { login };

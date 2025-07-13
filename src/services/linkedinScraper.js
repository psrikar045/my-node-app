const { getCluster } = require('./puppeteerSetup');
const { normalizeLinkedInUrl } = require('../utils/urlUtils');
const { ErrorTypes, createError } = require('../utils/errorUtils');

/**
 * Scrape LinkedIn for company data.
 * Performs a single browser visit and extracts the name and short description.
 * Additional anti-bot scripts are injected to increase stealthiness.
 *
 * @param {string} url LinkedIn company URL.
 * @returns {Promise<object>} Extracted company information.
 */
async function extractCompanyDataFromLinkedIn(url) {
  const cleanUrl = normalizeLinkedInUrl(url);
  try {
    const cluster = await getCluster();
    const data = await cluster.execute({ url: cleanUrl }, async ({ page }) => {
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        window.navigator.chrome = { runtime: {} };
      });

      await page.goto(cleanUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      const name = await page.$eval('h1', el => el.textContent.trim());
      const description = await page.$eval('main', el => el.innerText.slice(0, 200));
      return { name, description, linkedin: cleanUrl };
    });
    return { success: true, data };
  } catch (error) {
    if (error.code === 'ECONNRESET') {
      throw createError(
        ErrorTypes.ECONNRESET,
        'Connection was reset by LinkedIn — possible bot detection or network instability.'
      );
    }
    throw createError(ErrorTypes.NetworkError, error.message);
  }
}

/**
 * Retry LinkedIn extraction with exponential backoff.
 * Logs each attempt and delays between retries.
 *
 * @param {string} url LinkedIn company URL.
 * @param {number} [retries=3] Maximum attempts.
 * @returns {Promise<object>} Extracted company information.
 */
async function retryLinkedInExtraction(url, retries = 3) {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      console.log(`[LinkedIn] attempt ${attempt + 1}`);
      return await extractCompanyDataFromLinkedIn(url);
    } catch (err) {
      lastError = err;
      attempt += 1;
      if (attempt >= retries) break;
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.warn(`[LinkedIn] attempt ${attempt} failed. Retrying in ${delay}ms`);
      await new Promise(res => setTimeout(res, delay));
    }
  }

  throw lastError || createError(ErrorTypes.NetworkError, 'LinkedIn scraping failed');
}

module.exports = {
  extractCompanyDataFromLinkedIn,
  retryLinkedInExtraction,
};

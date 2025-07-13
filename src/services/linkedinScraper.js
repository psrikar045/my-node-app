const { getCluster } = require('./puppeteerSetup');
const { normalizeLinkedInUrl } = require('../utils/urlUtils');
const { ErrorTypes, createError } = require('../utils/errorUtils');

/**
 * Scrape LinkedIn for company data with retry logic.
 * @param {string} url LinkedIn company URL.
 * @returns {Promise<object>} Extracted data.
 */
async function extractCompanyDataFromLinkedIn(url) {
  const cleanUrl = normalizeLinkedInUrl(url);
  const maxRetries = 3;
  let attempt = 0;
  let lastErr;

  while (attempt < maxRetries) {
    attempt += 1;
    try {
      const cluster = await getCluster();
      const data = await cluster.execute({ url: cleanUrl }, async ({ page }) => {
        await page.goto(cleanUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        const name = await page.$eval('h1', el => el.textContent.trim());
        const description = await page.$eval('main', el => el.innerText.slice(0,200));
        return { name, description, linkedin: cleanUrl };
      });
      return { success: true, data };
    } catch (err) {
      lastErr = err;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw createError(ErrorTypes.NetworkError, lastErr?.message || 'LinkedIn scraping failed');
}

module.exports = { extractCompanyDataFromLinkedIn };

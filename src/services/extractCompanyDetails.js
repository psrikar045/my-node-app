const Redis = require('ioredis');
const { getCluster } = require('./puppeteerSetup');
const { retryLinkedInExtraction } = require('./linkedinScraper');
const { ErrorTypes, createError } = require('../utils/errorUtils');
const { isValidUrl, isDomainResolvable } = require('../utils/urlUtils');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const TTL_SECONDS = 600; // 10 minutes

/**
 * Extract company details from a website and optionally LinkedIn.
 * @param {string} url Target website URL.
 * @param {string} [linkedin] LinkedIn company URL.
 * @returns {Promise<object>}
 */
async function extractCompanyDetails(url, linkedin) {
  const normalized = isValidUrl(url);
  if (!normalized) {
    throw createError(ErrorTypes.NetworkError, 'Invalid URL');
  }

  if (!await isDomainResolvable(normalized)) {
    throw createError(ErrorTypes.NetworkError, 'Domain cannot be resolved');
  }

  const cacheKey = `extract:${normalized}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return { ...(JSON.parse(cached)), _cached: true };
  }

  const cluster = await getCluster();
  const siteData = await cluster.execute({ url: normalized }, async ({ page }) => {
    await page.goto(normalized, { waitUntil: 'networkidle2', timeout: 60000 });
    const title = await page.title();
    const description = await page.$eval('meta[name=description]', el => el.content,).catch(() => '');
    return { title, description, url: normalized };
  });

  let linkedinData = null;
  if (linkedin) {
    try {
      const withTimeout = (promise, ms) => {
        let t;
        return Promise.race([
          promise,
          new Promise((_, reject) => {
            t = setTimeout(() => reject(createError(ErrorTypes.TimeoutError, 'LinkedIn extraction timeout')), ms);
          })
        ]).finally(() => clearTimeout(t));
      };

      const res = await withTimeout(retryLinkedInExtraction(linkedin), 120000);
      linkedinData = res.data;
    } catch (err) {
      console.error(err);
    }
  }

  const result = { success: true, site: siteData, linkedin: linkedinData };
  await redis.set(cacheKey, JSON.stringify(result), 'EX', TTL_SECONDS);
  return result;
}

module.exports = { extractCompanyDetails };

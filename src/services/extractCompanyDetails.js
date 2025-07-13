const { getCluster } = require('./puppeteerSetup');
const { retryLinkedInExtraction, extractCompanyDataFromLinkedIn } = require('./linkedinScraper');
const { ErrorTypes, createError } = require('../utils/errorUtils');
const { isValidUrl, isDomainResolvable } = require('../utils/urlUtils');
const { extractFonts } = require('../utils/fontUtils');

// simple in-memory cache to avoid external dependencies
const extractionCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 100;

function setupPuppeteerPageForCompanyDetails(page) {
  return page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    window.navigator.chrome = { runtime: {} };
  });
}

async function extractCompanyDetailsFromPage(page, url) {
  await setupPuppeteerPageForCompanyDetails(page);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  const title = await page.title().catch(() => null);
  const description = await page
    .$eval('meta[name=description]', el => el.content)
    .catch(() => '');

  const logoUrl = await page
    .$eval('link[rel="icon"]', el => el.href)
    .catch(async () =>
      page.$eval('img[alt*="logo" i]', img => img.src).catch(() => null)
    );

  const colors = await page.evaluate(() => {
    const set = new Set();
    document.querySelectorAll('*').forEach(el => {
      const c = getComputedStyle(el).color;
      if (c) set.add(c);
    });
    return Array.from(set).slice(0, 4);
  });

  const fonts = await extractFonts(page).catch(() => []);

  const socials = await page.evaluate(() => {
    const map = {};
    const find = (name, pattern) => {
      const a = document.querySelector(`a[href*="${pattern}"]`);
      if (a) map[name] = a.href;
    };
    find('LinkedIn', 'linkedin.com');
    find('Twitter', 'twitter.com');
    find('Facebook', 'facebook.com');
    find('Instagram', 'instagram.com');
    find('YouTube', 'youtube.com');
    return map;
  });

  return { title, description, logoUrl, colors, fonts, socialLinks: socials };
}

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
  const cached = extractionCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[cache] hit ${normalized}`);
    return { ...(cached.data), _cached: true };
  }
  console.log(`[cache] miss ${normalized}`);

  const cluster = await getCluster();
  const start = Date.now();
  let siteData;
  try {
    siteData = await cluster.execute({ url: normalized }, async ({ page }) => {
      return await extractCompanyDetailsFromPage(page, normalized);
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw createError(ErrorTypes.TimeoutError, 'Website timed out');
    }
    throw createError(ErrorTypes.NavigationError, err.message);
  }

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

  const result = {
    success: true,
    site: siteData,
    linkedin: linkedinData,
    _performance: { ms: Date.now() - start }
  };

  extractionCache.set(cacheKey, { data: result, timestamp: Date.now() });
  if (extractionCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = extractionCache.keys().next().value;
    extractionCache.delete(oldestKey);
  }

  return result;
}

module.exports = { extractCompanyDetails };

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Cluster } = require('puppeteer-cluster');

puppeteer.use(StealthPlugin());

let cluster;

/**
 * Build Puppeteer launch options respecting HEADLESS_DEBUG and remote browser.
 * @returns {object} Launch options.
 */
function getLaunchOptions() {
  const headless = process.env.HEADLESS_DEBUG !== 'false';
  const opts = {
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };
  if (process.env.BROWSER_WS_URL) {
    opts.browserWSEndpoint = process.env.BROWSER_WS_URL;
  }
  return opts;
}

/**
 * Initialize a shared Puppeteer Cluster for browser pooling.
 * Fallbacks to local launch when remote endpoint is unavailable.
 * @returns {Promise<import('puppeteer-cluster').Cluster>}
 */
async function getCluster() {
  if (!cluster) {
    cluster = await Cluster.launch({
      puppeteer,
      puppeteerOptions: getLaunchOptions(),
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: parseInt(process.env.POOL_SIZE || '2', 10)
    });
  }
  return cluster;
}

module.exports = { getCluster };

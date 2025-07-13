const dns = require('dns').promises;

/**
 * Validate and normalize a URL string.
 * @param {string} urlString Potential URL.
 * @returns {string|false} Normalized URL or false.
 */
function isValidUrl(urlString = '') {
  let url = urlString.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    return new URL(url).href;
  } catch {
    return false;
  }
}

/**
 * Check DNS resolvability of the URL's hostname.
 * @param {string} url Normalized URL.
 * @returns {Promise<boolean>} Whether DNS lookup succeeds.
 */
async function isDomainResolvable(url) {
  try {
    const hostname = new URL(url).hostname;
    await dns.lookup(hostname);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize LinkedIn company URLs to avoid duplicates.
 * @param {string} url LinkedIn URL.
 * @returns {string} Cleaned LinkedIn URL.
 */
function normalizeLinkedInUrl(url = '') {
  return url.trim()
    .replace(/\/(mycompany|about|overview)(\/)?$/, '')
    .replace(/\/+$/, '');
}

module.exports = {
  isValidUrl,
  isDomainResolvable,
  normalizeLinkedInUrl
};

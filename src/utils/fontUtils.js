/**
 * Extract fonts used on the page.
 * Placeholder implementation.
 * @param {import('puppeteer').Page} page Puppeteer page.
 * @returns {Promise<string[]>} Array of font family names.
 */
async function extractFonts(page) {
  const fonts = await page.evaluate(() => {
    const families = new Set();
    document.querySelectorAll('*').forEach(el => {
      const f = getComputedStyle(el).fontFamily;
      if (f) families.add(f.split(',')[0].replace(/"/g, '').trim());
    });
    return Array.from(families).slice(0, 5);
  });
  return fonts;
}

module.exports = { extractFonts };

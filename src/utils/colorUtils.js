/**
 * Calculate Euclidean distance between two RGB colors.
 * @param {number} r1
 * @param {number} g1
 * @param {number} b1
 * @param {number} r2
 * @param {number} g2
 * @param {number} b2
 * @returns {number}
 */
function calculateColorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
}

/**
 * Parse an RGB string into r,g,b components.
 * @param {string} str
 * @returns {{r:number,g:number,b:number}|null}
 */
function getRGBFromString(str) {
  const m = str?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
}

module.exports = { calculateColorDistance, getRGBFromString };

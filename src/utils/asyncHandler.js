/**
 * Wraps an async Express handler and forwards rejections to next().
 * @param {Function} fn Async route handler.
 * @returns {import('express').RequestHandler} Wrapped handler.
 */
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

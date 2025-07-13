/**
 * Enum of standardized error categories.
 */
const ErrorTypes = {
  TimeoutError: 'TimeoutError',
  NavigationError: 'NavigationError',
  LinkedInBotDetection: 'LinkedInBotDetection',
  ExtractionError: 'ExtractionError',
  NetworkError: 'NetworkError',
  ECONNRESET: 'ECONNRESET'
};

/**
 * Create a consistent error response body.
 * @param {string} type Error type.
 * @param {string} message Description.
 * @returns {{success:false,errorType:string,errorMessage:string}}
 */
function createError(type, message) {
  return { success: false, errorType: type, errorMessage: message };
}

module.exports = { ErrorTypes, createError };

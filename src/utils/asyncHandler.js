/**
 * Wraps an async Express route handler to automatically catch
 * promise rejections and forward them to the error handler middleware.
 *
 * @param {Function} fn - Async function(req, res, next)
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;

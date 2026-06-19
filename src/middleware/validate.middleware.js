const { validationResult } = require('express-validator');

/**
 * Express-validator result handler middleware.
 * Runs after validation chains and checks for errors.
 * If validation errors exist, returns a 400 response with structured error details.
 * If validation passes, calls next().
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  next();
};

module.exports = validate;

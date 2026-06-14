import AppError from './app-error.js';

/**
 * Validate that required fields are present and non-empty.
 */
export const validateRequired = (body, fields) => {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }
};

/**
 * Validate that a value is within an allowed enum set.
 */
export const validateEnum = (value, allowed, fieldName) => {
  if (value !== undefined && value !== null && !allowed.includes(value)) {
    throw new AppError(
      `Invalid ${fieldName}: must be one of ${allowed.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }
};

/**
 * Validate MongoDB ObjectId format.
 */
export const validateObjectId = (id, fieldName = 'id') => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    throw new AppError(`Invalid ${fieldName} format`, 400, 'VALIDATION_ERROR');
  }
};

/**
 * Validate number is within a range.
 */
export const validateRange = (value, min, max, fieldName) => {
  if (value !== undefined && value !== null) {
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
      throw new AppError(
        `${fieldName} must be between ${min} and ${max}`,
        400,
        'VALIDATION_ERROR'
      );
    }
  }
};

/**
 * Validate month format (YYYY-MM).
 */
export const validateMonth = (value, fieldName = 'month') => {
  if (value && !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    throw new AppError(
      `${fieldName} must be in YYYY-MM format`,
      400,
      'VALIDATION_ERROR'
    );
  }
};

/**
 * Validate time format (HH:mm).
 */
export const validateTime = (value, fieldName = 'time') => {
  if (value && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    throw new AppError(
      `${fieldName} must be in HH:mm format`,
      400,
      'VALIDATION_ERROR'
    );
  }
};

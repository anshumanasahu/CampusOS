/**
 * Send a successful JSON response.
 */
export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Send a created (201) response.
 */
export const sendCreated = (res, data) => {
  sendSuccess(res, data, 201);
};

/**
 * Send a message-only success response.
 */
export const sendMessage = (res, message, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data: { message },
  });
};

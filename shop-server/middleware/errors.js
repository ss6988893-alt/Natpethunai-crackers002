export function notFound(request, response) { response.status(404).json({ success: false, message: 'The requested resource was not found.' }); }
export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);
  console.error(error);
  const uploadMessages = { LIMIT_FILE_SIZE: 'Each image must be 5 MB or smaller.', LIMIT_FILE_COUNT: 'You can upload a maximum of 6 images.', LIMIT_UNEXPECTED_FILE: 'The image upload field is invalid.' };
  const duplicateField = error.code === 11000 ? Object.keys(error.keyPattern || error.keyValue || {})[0] : '';
  const status = error.status || (error.name === 'CastError' ? 404 : error.name === 'ValidationError' || uploadMessages[error.code] ? 400 : error.code === 11000 ? 409 : 500);
  const message = uploadMessages[error.code] || (duplicateField ? `A product with this ${duplicateField} already exists.` : error.name === 'ValidationError' ? Object.values(error.errors || {})[0]?.message : status === 500 ? 'Unable to save the product. Please try again.' : error.message);
  response.status(status).json({ success: false, message });
}

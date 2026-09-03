export function notFound(request, response) { response.status(404).json({ success: false, message: 'The requested resource was not found.' }); }
export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);
  console.error(error);
  const status = error.status || (error.name === 'CastError' ? 404 : 500);
  response.status(status).json({ success: false, message: status === 500 ? 'Something went wrong. Please try again.' : error.message });
}

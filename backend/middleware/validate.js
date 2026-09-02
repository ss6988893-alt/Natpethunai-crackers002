export function validate(schema) {
  return (request, response, next) => {
    const result = schema.safeParse({ body: request.body, params: request.params, query: request.query });
    if (!result.success) return response.status(422).json({ success: false, message: 'Please correct the highlighted information.', errors: result.error.flatten() });
    request.validated = result.data;
    return next();
  };
}

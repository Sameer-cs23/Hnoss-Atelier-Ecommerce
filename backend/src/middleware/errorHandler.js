module.exports = function errorHandler(err, req, res, _next) {
  if (err.code === '23505') {
    const field = err.constraint?.includes('slug') ? 'slug'
                : err.constraint?.includes('sku')  ? 'sku_code'
                : 'field';
    return res.status(409).json({
      error: 'DUPLICATE_VALUE',
      message: `Duplicate value for ${field}`,
      field
    });
  }
  if (err.code === '23514' || err.code === '23503') {
    return res.status(422).json({
      error: 'CONSTRAINT_VIOLATION',
      message: err.detail || err.message
    });
  }
  if (err.code === 'P0001') {
    return res.status(422).json({ error: 'BUSINESS_RULE', message: err.message });
  }
  if (err.status) {
    return res.status(err.status).json({ error: err.code || 'ERROR', message: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'INTERNAL', message: 'Unexpected server error' });
};
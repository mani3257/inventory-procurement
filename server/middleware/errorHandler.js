const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: field + ' already exists' });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Server error'
  });
};

const notFound = (req, res, next) => {
  const error = new Error('Route not found - ' + req.originalUrl);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
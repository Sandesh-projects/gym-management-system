// server/middleware/errorMiddleware.js

// Middleware to handle 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the next error handling middleware
};

// Middleware to handle general errors
// This will catch errors thrown by routes or other middleware (e.g., using next(error))
const errorHandler = (err, req, res, next) => {
  // Determine the status code (default to 500 if not set)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  // Send a JSON response with the error message and stack trace (only in development)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Don't expose stack in production
  });
};

module.exports = {
  notFound,
  errorHandler,
};
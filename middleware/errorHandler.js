// 404 for routes that dont exist
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
};

// central error handler, all controllers call next(err)
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Server Error";
  let errors;

  // mongoose schema validation errors
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // bad object id
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // duplicate key (sku is unique)
  if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue).join(", ")}`;
  }

  // invalid json body
  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
  }

  if (status === 500) console.log(err);

  res.status(status).json({ message, ...(errors && { errors }) });
};

module.exports = { notFound, errorHandler };

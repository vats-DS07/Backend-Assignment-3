const mongoose = require("mongoose");

// basic checks before the request even reaches mongoose
// (mongoose schema does the detailed validation)

const validateProduct = (req, res, next) => {
  const { name, sku, category, price, quantity } = req.body;
  const errors = [];

  // for POST all these fields are needed
  if (req.method === "POST") {
    if (!name) errors.push("name is required");
    if (!sku) errors.push("sku is required");
    if (!category) errors.push("category is required");
    if (price === undefined) errors.push("price is required");
    if (quantity === undefined) errors.push("quantity is required");
  }

  if (price !== undefined && typeof price !== "number") {
    errors.push("price must be a number");
  }
  if (quantity !== undefined && typeof quantity !== "number") {
    errors.push("quantity must be a number");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  next();
};

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  next();
};

const validateStockChange = (req, res, next) => {
  const { change } = req.body;
  if (change === undefined || !Number.isInteger(change) || change === 0) {
    return res
      .status(400)
      .json({ message: "change must be a non-zero whole number (+ for restock, - for sale)" });
  }
  next();
};

module.exports = { validateProduct, validateId, validateStockChange };

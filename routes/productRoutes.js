const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStock,
  getCategorySummary,
} = require("../controllers/productController");

const {
  validateProduct,
  validateId,
  validateStockChange,
} = require("../middleware/validateProduct");

// NOTE: report routes must be above /:id otherwise "low-stock" gets treated as an id
router.get("/low-stock", getLowStock);
router.get("/summary", getCategorySummary);

router.route("/").get(getProducts).post(validateProduct, createProduct);

router
  .route("/:id")
  .get(validateId, getProductById)
  .put(validateId, validateProduct, updateProduct)
  .delete(validateId, deleteProduct);

router.patch("/:id/stock", validateId, validateStockChange, updateStock);

module.exports = router;

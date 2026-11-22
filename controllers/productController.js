const Product = require("../models/Product");

// @route  POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/products
// query params: category, supplier, search, minPrice, maxPrice, inStock, sort, page, limit
// eg: /api/products?category=Electronics&minPrice=500&sort=-price&page=1&limit=5
const getProducts = async (req, res, next) => {
  try {
    const { category, supplier, search, minPrice, maxPrice, inStock, sort } = req.query;

    // ---- filtering ----
    const filter = {};
    if (category) filter.category = category;
    if (supplier) filter.supplier = { $regex: supplier, $options: "i" };
    if (search) filter.name = { $regex: search, $options: "i" };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") filter.quantity = { $gt: 0 };
    if (inStock === "false") filter.quantity = 0;

    // ---- sorting ----
    // sort=price (asc) , sort=-price (desc), sort=category,-price (multiple)
    let sortBy = "-createdAt";
    if (sort) sortBy = sort.split(",").join(" ");

    // ---- pagination ----
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sortBy).skip(skip).limit(limit);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated doc
      runValidators: true, // so schema rules apply on update too
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/products/:id/stock
// body: { "change": 10 }  -> restock
//       { "change": -3 }  -> sale
const updateStock = async (req, res, next) => {
  try {
    const { change } = req.body;

    // check product exists first so we can send a proper 404
    const exists = await Product.findById(req.params.id);
    if (!exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    // $inc is atomic, and the quantity condition makes sure stock never goes below 0
    // (if 2 sales happen at the same time only the valid one will go through)
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, quantity: { $gte: change < 0 ? -change : 0 } },
      { $inc: { quantity: change } },
      { new: true }
    );

    if (!product) {
      return res.status(400).json({
        message: `Not enough stock. Available: ${exists.quantity}, requested: ${-change}`,
      });
    }

    res.json({ message: "Stock updated", product });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted", id: product._id });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/products/low-stock
// products where quantity <= reorderLevel
const getLowStock = async (req, res, next) => {
  try {
    // $expr lets us compare two fields of the same document
    const items = await Product.find({
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    }).sort({ quantity: 1 });

    res.json({ count: items.length, lowStockItems: items });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/products/summary
// category wise summary using aggregation pipeline
const getCategorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          avgPrice: { $avg: "$price" },
        },
      },
      { $sort: { totalStockValue: -1 } },
      {
        $project: {
          totalItems: 1,
          totalQuantity: 1,
          totalStockValue: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
        },
      },
    ]);

    res.json({ categories: summary.length, summary });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStock,
  getCategorySummary,
};

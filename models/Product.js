const mongoose = require("mongoose");

// categories allowed in our store
const CATEGORIES = ["Electronics", "Apparel", "Furniture", "Stationery", "Grocery"];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name should be at least 2 characters"],
      maxlength: [100, "Name can't be more than 100 characters"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
      // format like FURN-TB-812 or STNY-PN-713
      match: [/^[A-Z]{3,5}-[A-Z]{2}-\d{3}$/, "SKU must be in format like ELEC-HP-101"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: "{VALUE} is not a valid category",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price can't be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity can't be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: [0, "Reorder level can't be negative"],
    },
    supplier: {
      type: String,
      trim: true,
      default: "Unknown",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// total value of stock for this product (not saved in db)
productSchema.virtual("stockValue").get(function () {
  return this.price * this.quantity;
});

module.exports = mongoose.model("Product", productSchema);

// run with: npm run seed
// clears the products collection and adds some sample data for testing

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  { name: "Wireless Mouse", sku: "ELEC-MS-101", category: "Electronics", price: 799, quantity: 35, reorderLevel: 10, supplier: "Logitech" },
  { name: "Bluetooth Headphones", sku: "ELEC-HP-102", category: "Electronics", price: 2499, quantity: 8, reorderLevel: 10, supplier: "boAt" },
  { name: "Mechanical Keyboard", sku: "ELEC-KB-103", category: "Electronics", price: 3299, quantity: 20, reorderLevel: 5, supplier: "Redragon" },
  { name: "27 inch Monitor", sku: "ELEC-MN-104", category: "Electronics", price: 15999, quantity: 12, reorderLevel: 4, supplier: "Dell India" },
  { name: "Cotton T-Shirt", sku: "APRL-TS-201", category: "Apparel", price: 499, quantity: 60, reorderLevel: 15, supplier: "Jockey" },
  { name: "Denim Jacket", sku: "APRL-JK-202", category: "Apparel", price: 2299, quantity: 6, reorderLevel: 8, supplier: "Levis" },
  { name: "Study Table", sku: "FURN-TB-812", category: "Furniture", price: 3999, quantity: 2, reorderLevel: 4, supplier: "IKEA India" },
  { name: "Office Chair", sku: "FURN-CH-813", category: "Furniture", price: 5499, quantity: 9, reorderLevel: 3, supplier: "Green Soul" },
  { name: "A4 Notebook Pack", sku: "STNY-NB-711", category: "Stationery", price: 250, quantity: 100, reorderLevel: 25, supplier: "Classmate" },
  { name: "Geometry Box", sku: "STNY-GB-712", category: "Stationery", price: 180, quantity: 15, reorderLevel: 20, supplier: "Camlin" },
  { name: "Basmati Rice 5kg", sku: "GROC-RC-301", category: "Grocery", price: 650, quantity: 40, reorderLevel: 10, supplier: "India Gate" },
  { name: "Green Tea 100 bags", sku: "GROC-TE-302", category: "Grocery", price: 399, quantity: 25, reorderLevel: 10, supplier: "Lipton" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log(`Inserted ${products.length} products`);
  } catch (err) {
    console.log("Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();

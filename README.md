# Lab 3 - Inventory and Data Management System

Name: Vats Aggarwal  
Roll No: 2501060106

Backend REST API for managing products in a store / warehouse.
Made using Node.js, Express, MongoDB (Mongoose) and dotenv.

## How to run

1. Install packages
   ```
   npm install
   ```
2. Make a `.env` file (copy from `.env.example`)
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/inventoryDB
   ```
3. Add sample data (12 products, 5 categories)
   ```
   npm run seed
   ```
4. Start server
   ```
   npm start
   ```
   Server runs on http://localhost:5000

## Folder structure

```
inventory-system/
├── config/db.js                    -> mongodb connection
├── models/Product.js               -> schema + validation + stockValue virtual
├── controllers/productController.js
├── routes/productRoutes.js
├── middleware/
│   ├── validateProduct.js          -> checks body, id, stock change
│   └── errorHandler.js             -> 404 + central error handler
├── seed.js
└── server.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/products | Create product |
| GET | /api/products | Get all products (filter, sort, pagination) |
| GET | /api/products/:id | Get single product |
| PUT | /api/products/:id | Update product details |
| PATCH | /api/products/:id/stock | Restock / sale (`{ "change": 10 }` or `{ "change": -3 }`) |
| DELETE | /api/products/:id | Delete product |
| GET | /api/products/low-stock | Products where quantity <= reorderLevel |
| GET | /api/products/summary | Category wise summary (aggregation) |

### Query params for GET /api/products

- `category` - exact category eg `Electronics`
- `supplier` - partial match
- `search` - search in product name
- `minPrice`, `maxPrice`
- `inStock=true` / `inStock=false`
- `sort` - `price`, `-price`, `name`, `-quantity`, multiple with comma `category,-price`
- `page` (default 1), `limit` (default 10, max 50)

Example:
```
GET /api/products?category=Electronics&minPrice=1000&sort=-price&page=1&limit=5
```

### Sample POST body

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

## Validation rules

- name: required, 2-100 chars
- sku: required, unique, format `ABCD-XX-123` (auto uppercase)
- category: Electronics / Apparel / Furniture / Stationery / Grocery
- price: required, >= 0
- quantity: required, whole number, >= 0
- reorderLevel: default 10
- supplier: default "Unknown"

## Error responses

- 400 - validation failed / invalid id / invalid json / not enough stock
- 404 - product or route not found
- 409 - duplicate SKU
- 500 - server error

## Notes

- `stockValue` (price x quantity) is a virtual field so it's not stored in db, just shown in response.
- Stock update uses `$inc` with a condition `quantity >= amount` so the quantity can never go negative, even if two sales hit at the same time.
- `/low-stock` and `/summary` routes are written before `/:id` in the router, otherwise express treats "low-stock" as an id.

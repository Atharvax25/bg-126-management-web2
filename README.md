# Management E-Commerce Website - ForgeCart

ForgeCart is now a full-stack Management E-Commerce System. The project started as a static HTML/CSS storefront UI and has been upgraded with a working Node.js backend, MongoDB database integration, JWT authentication, product APIs, and order APIs.

## Overview

ForgeCart provides a complete e-commerce flow:

- Static multi-page frontend using HTML, CSS, and JavaScript
- Express.js backend API
- MongoDB database using Mongoose
- User registration and login
- JWT-protected routes
- Dynamic product loading
- Search and category filtering
- Order creation and order history
- Product stock validation

## Tech Stack

Frontend:

- HTML5
- CSS3
- JavaScript
- Font Awesome
- Google Fonts

Backend:

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- dotenv
- CORS

## Project Structure

```text
/
|-- backend/
|   |-- server.js
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- productController.js
|   |   `-- orderController.js
|   |-- middleware/
|   |   `-- authMiddleware.js
|   |-- models/
|   |   |-- User.js
|   |   |-- Product.js
|   |   `-- Order.js
|   `-- routes/
|       |-- authRoutes.js
|       |-- productRoutes.js
|       `-- orderRoutes.js
|-- js/
|   |-- api.js
|   |-- auth.js
|   |-- products.js
|   `-- orders.js
|-- assets/
|   `-- images/
|-- css/
|   `-- styles.css
|-- index.html
|-- login.html
|-- register.html
|-- orders.html
|-- cart.html
|-- checkout.html
|-- product.html
|-- .env.example
|-- package.json
`-- README.md
```

## Backend Features Added

### Express Server

The backend starts from:

```text
backend/server.js
```

It includes:

- Express server setup
- CORS middleware
- JSON body parsing
- Static frontend hosting
- API route mounting
- Health check route
- MongoDB connection and product seeding

Server URL:

```text
http://localhost:5000
```

Health check:

```text
GET /health
```

## Database Connection

MongoDB is connected using Mongoose in:

```text
backend/config/db.js
```

The connection string is stored in `.env` as:

```env
MONGO_URI=your_mongodb_connection_string
```

The project supports MongoDB Atlas. If using Atlas, make sure your IP address is added in Atlas Network Access.

## Models

### User Model

File:

```text
backend/models/User.js
```

Fields:

- `name`
- `email`
- `password`
- `role`

Notes:

- Email is unique
- Password is hashed before saving
- Role can be `user` or `admin`

### Product Model

File:

```text
backend/models/Product.js
```

Fields:

- `name`
- `price`
- `image`
- `category`
- `description`
- `stock`

### Order Model

File:

```text
backend/models/Order.js
```

Fields:

- `userId`
- `products`
- `totalAmount`
- `status`

## Authentication

Authentication was added using bcrypt and JWT.

Files:

```text
backend/controllers/authController.js
backend/routes/authRoutes.js
backend/middleware/authMiddleware.js
```

Features:

- Register user
- Login user
- Hash passwords with bcrypt
- Generate JWT token
- Protect private routes
- Admin-only middleware

Auth APIs:

```text
POST /api/auth/register
POST /api/auth/login
```

Register request example:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Login request example:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Login response includes:

- JWT token
- User details

## Product APIs

Files:

```text
backend/controllers/productController.js
backend/routes/productRoutes.js
```

Routes:

```text
GET /api/products
GET /api/products?search=hoodie
GET /api/products?category=clothing
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

Notes:

- `GET /api/products` is public
- Create, update, and delete product routes are protected
- Product management routes require admin role
- Search works on product name, category, and description
- Category filtering supports values like `clothing`, `digital`, and `accessories`

## Order APIs

Files:

```text
backend/controllers/orderController.js
backend/routes/orderRoutes.js
```

Routes:

```text
POST /api/orders
GET /api/orders
```

Features:

- Requires JWT token
- Creates order for logged-in user
- Checks if product exists
- Checks stock before creating order
- Decreases product stock after order creation
- Users can view their own orders
- Admin users can view all orders

Order request example:

```json
{
  "products": ["product_id_here"]
}
```

Authorization header:

```text
Authorization: Bearer your_jwt_token
```

## Frontend Integration

The existing static frontend is connected to the backend using JavaScript.

Files added:

```text
js/api.js
js/auth.js
js/products.js
js/orders.js
```

### Login Page

File:

```text
login.html
```

Changes:

- Login form calls `POST /api/auth/login`
- JWT token is saved in `localStorage`
- User is redirected to `index.html`

### Register Page

File:

```text
register.html
```

Changes:

- Register form calls `POST /api/auth/register`
- Password confirmation is checked
- User is redirected to `login.html`

### Product Listing Page

File:

```text
index.html
```

Changes:

- Products are fetched from `GET /api/products`
- Product cards are rendered dynamically
- Search input calls backend search
- Category filter calls backend category filtering
- Add to Cart button creates an order through `POST /api/orders`

### Orders Page

File:

```text
orders.html
```

Changes:

- Orders are fetched from `GET /api/orders`
- JWT token is used for authorization
- User order history is displayed dynamically

## Default Product Seeding

When the products collection is empty, the backend automatically inserts default ForgeCart products:

- Hackathon Hoodie 2026
- Code Powered T-Shirt
- Premium Dev Backpack
- API Access Token
- Developer Sticker Pack
- Debug Fuel Mug

This makes the product page usable immediately after connecting the database.

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

An example file is included:

```text
.env.example
```

Important:

- Do not commit real passwords or secrets
- Replace `<db_password>` with your real MongoDB Atlas password
- Encode special characters in the password if needed

Examples:

```text
@ becomes %40
# becomes %23
% becomes %25
& becomes %26
```

## MongoDB Atlas Setup

To connect with MongoDB Atlas:

1. Create a database user in Atlas Database Access
2. Add your current public IP in Atlas Network Access
3. Use the Atlas connection string in `.env`
4. Restart the backend server

For local development, Atlas Network Access can use your current IP:

```text
your_public_ip/32
```

For temporary testing only, you can allow:

```text
0.0.0.0/0
```

## Installation

Install dependencies:

```bash
npm install
```

## Run Project

Start the backend:

```bash
npm start
```

Development mode with nodemon:

```bash
npm run dev
```

Open the project in browser:

```text
http://localhost:5000/index.html
```

The backend must stay running while using the frontend.

## API Summary

Auth:

```text
POST /api/auth/register
POST /api/auth/login
```

Products:

```text
GET /api/products
GET /api/products?search=
GET /api/products?category=
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

Orders:

```text
POST /api/orders
GET /api/orders
```

Health:

```text
GET /health
```

## Error Handling

The backend handles:

- Duplicate user registration
- Invalid login credentials
- Missing JWT token
- Invalid JWT token
- Unauthorized access
- Admin-only access
- Product not found
- Out-of-stock products
- MongoDB connection errors
- Unknown routes

## Current Status

ForgeCart is no longer frontend-only. It is now a working full-stack e-commerce management system with backend APIs, authentication, database storage, and frontend API integration.

## Future Enhancements

Possible future improvements:

- Admin dashboard UI
- Cart persistence before checkout
- Payment gateway integration
- Product image upload
- User profile page
- Order status management
- Wishlist feature
- Product reviews and ratings

## Latest Advanced Feature Updates

The project was further upgraded with production-style e-commerce features on both backend and frontend.

### Smart Search Autocomplete

Added a smart product search API:

```text
GET /api/products/search?q=keyword
```

Features:

- Searches products by name
- Uses case-insensitive regex matching
- Returns the top 5 matching products
- Displays autocomplete suggestions under the search input on the store page

### Inventory Alert System

Inventory handling was improved with low-stock monitoring.

Features:

- Product stock is validated so it cannot become negative
- When product stock is below `5`, the backend logs:

```text
Low stock alert: product_name
```

- Low-stock checks run when products are fetched, searched, created, updated, or added to cart

### Persistent Multi-User Cart

A new database-backed cart system was added.

New model:

```text
backend/models/Cart.js
```

Cart fields:

- `userId`
- `products`
- `productId`
- `quantity`
- `updatedAt`

Cart APIs:

```text
POST /api/cart
GET /api/cart
DELETE /api/cart/:productId
```

Features:

- Cart is stored in MongoDB
- Cart persists after logout/login
- Each user has a separate cart
- Add to Cart now stores items in the user's saved cart
- Cart page dynamically loads saved cart items from database
- Cart checkout creates an order from saved cart products

### Bookmark System

Users can bookmark products.

APIs:

```text
POST /api/bookmark/:productId
GET /api/bookmark
```

Features:

- Add/remove bookmarked products
- View saved bookmarks on `bookmarks.html`
- Bookmark data is stored inside the user document

### Price Drop Notification Simulation

When an admin updates a product and reduces its price, the backend simulates a notification by logging a message.

Example:

```text
Price drop notification: Product price dropped from oldPrice to newPrice.
```

### Product Recommendation System

Added a recommendation API:

```text
GET /api/products/recommend/:productId
```

Recommendations are based on:

- Same product category
- Popular products from order history

The frontend displays recommended products after clicking the `Recommend` button.

### Price Range Filter

Product listing now supports price filtering.

Example:

```text
GET /api/products?minPrice=100&maxPrice=1000
```

The store page includes `Min price` and `Max price` fields.

### Admin Dashboard Analytics

Added an admin-only dashboard API:

```text
GET /api/admin/dashboard
```

Dashboard returns:

- Total users
- Total orders
- Total revenue
- Top-selling products

Frontend page:

```text
admin-dashboard.html
```

### Order Status Tracking

Orders now support status tracking.

Statuses:

- `pending`
- `shipped`
- `delivered`

Admin-only API:

```text
PUT /api/orders/:id/status
```

Admin users can update order status from the orders page.

### New Frontend Pages Added

```text
bookmarks.html
admin-dashboard.html
```

### New Frontend JavaScript Added

```text
js/cart.js
js/bookmarks.js
js/admin.js
```

### Updated Project Status

ForgeCart now includes authentication, product management, smart search, persistent cart, bookmarks, recommendations, admin analytics, inventory alerts, order status tracking, and MongoDB-backed data persistence.

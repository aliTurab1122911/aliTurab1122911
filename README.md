# Maison Minimal — CSV-Based Single Vendor Fashion E-commerce

A clean, fashion-first e-commerce platform built with simple technology and **no database**.
All persistent data is stored in CSV files directly inside the repository.

## Tech Stack

- Node.js + Express
- EJS templates (HTML/CSS/JS)
- Bootstrap 5 for consistent UI
- CSV files for persistence
- Session-based auth + cart
- Multer for product image uploads

## Features

### Customer
- Home page with featured products
- Product listing with category/search/sort
- Product detail with size variants
- Add to cart/update/remove cart items
- Checkout and fake order placement (no payment gateway)
- Register/login/logout
- View order history
- About page and Contact page

### Admin
- Dashboard (orders, sales, low stock)
- Add products via direct image upload (saved in `public/uploads`)
- Edit existing products (name, price, category, description, size-stock map, image)
- Toggle product visibility
- Update order statuses

## CSV Storage

The app stores data in `data/*.csv`:

- `categories.csv`
- `products.csv`
- `variants.csv`
- `users.csv`
- `orders.csv`
- `order_items.csv`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

3. Open:
   - Storefront: `http://localhost:3000`
   - Admin: login then visit `http://localhost:3000/admin`

## Default Admin Login

- Email: `admin@fashionbrand.com`
- Password: `admin123`

## cPanel Deployment Notes

- This app is monolithic and does not require MySQL.
- Upload repository, run `npm install`, set up Node app with startup file `server.js`, and start.
- Ensure `public/uploads` is writable by the Node process.

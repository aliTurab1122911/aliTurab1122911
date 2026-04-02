# Maison Minimal — CSV-Based Single Vendor Fashion E-commerce

A clean, fashion-first e-commerce platform built with simple technology and **no database**.
All persistent data is stored in CSV files (spreadsheet-friendly) directly inside the repository.

## Tech Stack

- Node.js + Express
- EJS templates (HTML/CSS/JS)
- Bootstrap 5 for consistent UI
- CSV files for persistence
- Session-based auth + cart
- Multer for admin image upload

## Features

### Customer
- Home page with featured products
- Product listing with category/search/sort
- Product detail with size variants
- Add to cart/update/remove cart items
- Checkout and fake order placement (no payment gateway)
- Register/login/logout
- View order history

### Admin
- Dashboard (orders, sales, low stock)
- Add products (image URL or upload image file)
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

You can open/edit these with Excel/Google Sheets if needed.

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

## Product Image Uploads

- Uploaded images are stored in: `public/uploads/`
- Admin can either provide an image URL or upload a local image file.

## cPanel Deployment Notes

- This app is monolithic and does not require MySQL.
- Upload repository, run `npm install`, set up Node app with startup file `server.js`, and start.
- Ensure `public/uploads` is writable by the Node process.


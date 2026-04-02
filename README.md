# Maison Minimal — Single Vendor Fashion E-commerce

A clean, fashion-first e-commerce platform built with simple technology for easy deployment on cPanel.

## Tech Stack

- Node.js + Express
- EJS templates (HTML/CSS/JS)
- Bootstrap 5 for consistent UI
- MySQL (mysql2)
- Session-based auth

## Features

### Customer
- Home page with fashion hero + featured products
- Product listing with category/search/sort filters
- Product detail with size variants and stock visibility
- Shopping cart (session-based)
- Checkout and order placement
- Login/Register + order history

### Admin
- Dashboard with sales/order/low-stock overview
- Product management (create + enable/disable)
- Order management (status updates)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MySQL credentials.

3. Create a MySQL database and set `DB_NAME` accordingly.

4. Initialize schema + seed data:
   ```bash
   npm run db:init
   ```

5. Start the app:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

## Default Admin

- Email: value of `ADMIN_EMAIL` in `.env` (default `admin@fashionbrand.com`)
- Password: value of `ADMIN_PASSWORD` in `.env` (default `admin123`)

## cPanel Deployment Guide

1. Upload project files to your cPanel hosting.
2. In cPanel, create MySQL database + user and grant privileges.
3. Use **Setup Node.js App** and point startup file to `server.js`.
4. Add environment variables in cPanel:
   - `NODE_ENV=production`
   - `PORT` (provided by cPanel app manager)
   - `SESSION_SECRET`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
5. Run `npm install` in app directory.
6. Run `npm run db:init` once to create tables and seed initial records.
7. Restart Node.js app from cPanel.

## Notes

- This is intentionally lightweight and simple for maintainability.
- Stripe integration can be added in a next phase by extending checkout/payment tables.

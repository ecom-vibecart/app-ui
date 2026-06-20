# vibecart-ui (app-ui)

Customer-facing storefront for VibeCart. Browse the product catalogue, manage cart, apply offers, and place orders.

**Port:** `3000`  
**React:** 19.2.7 | **Framework:** Create React App

---

## Features

- Product catalogue browsing (categories, items, variants)
- Responsive carousels and product detail pages
- Shopping cart and order summary
- Checkout with offer/coupon application
- Order history and confirmation
- Redux-powered global state management

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `react` | 19.2.7 | UI framework |
| `react-router-dom` | 6.30.4 | Client-side routing |
| `@reduxjs/toolkit` | 2.12.0 | State management |
| `react-redux` | 9.3.0 | React–Redux bindings |
| `axios` | 1.7.5 | HTTP client |
| `bootstrap` | 5.3.8 | CSS framework |
| `react-bootstrap` | 2.10.10 | Bootstrap React components |
| `react-slick` | 0.30.3 | Product carousel |
| `react-responsive-carousel` | 3.2.23 | Banner carousel |
| `react-icons` | 5.6.0 | Icon set |
| `@heroicons/react` | 2.2.0 | Hero icons |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm start

# Production build
npm run build
```

---

## Environment Variables

Create a `.env` file in this directory:

```
PORT=3000
REACT_APP_API_URL=http://localhost:5001
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
```

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | API Gateway base URL (all API calls go through this) |
| `PORT` | Dev server port |
| `GENERATE_SOURCEMAP` | Set `false` to reduce build size in production |

---

## API Integration

All API calls route through the gateway:

```
Base URL: REACT_APP_API_URL
Accounts: /api/v1/vibe-cart/accounts/**
Products:  /api/v1/vibe-cart/app/**
Orders:    /api/v1/vibe-cart/scm/**
Offers:    /api/v1/vibe-cart/offers/**
```

Authenticated requests must include `Authorization: Bearer <jwt>` header.

---

## Project Structure

```
src/
├── App.js
├── index.js
└── pages/
    ├── commoncomponents/   # Shared utilities, API config, error boundary
    └── components/
        ├── Homepage/       # Product listing, carousels, banners
        └── CartAndCheckout/
            ├── cart/       # Cart state and UI
            ├── checkout/   # Checkout flow (shipping, payment, offers)
            └── orders/     # Order confirmation and history
```

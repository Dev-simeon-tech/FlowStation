# ⛽ FlowStation — Gas Station Management System

> A full-stack web application for managing fuel stock, sales, suppliers, attendants, customers, and daily revenue summaries for a gas station.

---

![FlowStation Dashboard preview](./apps/client/public/screenshots/dashboard.png)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Team](#team)

---

## About

FlowStation is a database-driven management system built for gas stations. It tracks the full lifecycle of fuel — from supplier delivery into stock, through pump sales by attendants, down to daily revenue summaries and payment records. The system is designed around a single organisation account model, meaning each gas station registers once and all data (fuel products, stock, sales, customers, attendants) is scoped to that station.

This project was built as a group academic assignment to demonstrate relational database design, RESTful API development, and a connected full-stack application.

---

## ✨ Features

### 🏢 Organisation Management

- Gas station registers a single account with business details (name, address, phone, RC number)
- Secure login using email and password (bcrypt hashed)
- JWT-based authentication — all data is scoped to the logged-in station
- Organisation profile accessible and verifiable via `/api/auth/me`

### ⛽ Fuel Product Setup

- Create and manage fuel types: Petrol (PMS), Diesel (AGO), Kerosene (DPK)
- Set price per litre for each product
- Price is frozen on each sale record so historical revenue stays accurate even after price changes

### 🚚 Supplier Management

- Register fuel suppliers with contact details
- Link each supplier to the fuel types they supply (many-to-many via SupplierFuelType)
- View all deliveries made by a supplier

### 📦 Fuel Stock (Inventory)

- Record fuel deliveries from suppliers — each entry increases available stock
- View full delivery history with invoice numbers and dates
- Real-time stock balance calculated as: `total delivered − total sold` (no stored counter, always accurate)
- Insufficient stock check on every sale — cannot sell more than what is available

### 👷 Pump Attendant Registration

- Register pump attendants with employee ID and assigned pump
- Activate or deactivate attendants
- Every sale is linked to the attendant who made it

### 🛒 Fuel Sales Entry

- Record fuel sales with fuel type, litres, attendant, customer, and payment method
- Stock automatically reduces on every sale
- Unit price locked at time of sale
- Optional customer linkage (walk-in or registered customers)
- Payment record created in the same database transaction as the sale

### 👥 Customer Management

- Register customers with phone and vehicle plate number
- Support for walk-in (anonymous) and registered customer types
- Full purchase history per customer with spending breakdown by fuel type

### 💳 Payment Records

- Payment is recorded alongside every sale in a single atomic transaction
- Supports Cash, Card, and Bank Transfer payment methods
- Optional reference number for card/transfer payments

### 📊 Daily Sales Summary

- Live daily summary (calculated on the fly) — shows today's revenue, litres sold, opening and closing stock per fuel type
- End-of-day close-out saves the summary permanently to the database
- Summary history used to power revenue trend charts (last 7 days)

### 📈 Reports & Charts

- Revenue bar chart showing daily totals for the last 7 days
- Breakdown of revenue per fuel type with hover tooltips
- Stock balance view across all fuel products
- Customer purchase history with aggregate spend stats

---

## 🛠 Tech Stack

### Frontend — `apps/client`

| Technology   | Purpose                                    |
| ------------ | ------------------------------------------ |
| React + Vite | UI framework and dev server                |
| TypeScript   | Type safety on the frontend                |
| Tailwind CSS | Utility-first styling                      |
| React Router | Client-side routing                        |
| Recharts     | Bar charts and data visualisation          |
| apiFetch     | HTTP client with automatic token injection |

### Backend — `apps/server`

| Technology            | Purpose                               |
| --------------------- | ------------------------------------- |
| Node.js + Express     | REST API server                       |
| JavaScript (CommonJS) | Server-side language                  |
| Prisma ORM            | Database access and schema management |
| PostgreSQL            | Relational database                   |
| bcryptjs              | Password hashing                      |
| jsonwebtoken (JWT)    | Authentication tokens                 |
| dotenv                | Environment variable management       |

### Shared — `packages/shared`

| Technology         | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| Plain JS constants | Shared enums (FUEL_TYPES, PAYMENT_METHODS) used by both apps |

### Infrastructure

| Service        | Purpose                                  |
| -------------- | ---------------------------------------- |
| Neon           | Hosted PostgreSQL database (free tier)   |
| npm Workspaces | Monorepo management                      |
| concurrently   | Run client and server together from root |

---

## 🗄 Database Schema

The database has 10 tables all scoped to an `Organisation`:

```
Organisation ──┬──► FuelProduct ──┬──► FuelStock
               │                  ├──► FuelSale ──► Payment
               │                  ├──► DailySummary
               │                  └──► SupplierFuelType
               ├──► Supplier ─────────► SupplierFuelType
               ├──► Attendant ────────► FuelSale
               └──► Customer ─────────► FuelSale
```

**Key design decisions:**

- Stock balance is always computed (`SUM deliveries − SUM sales`) — never stored as a counter, so it can never drift out of sync
- `unitPrice` is frozen on each `FuelSale` row so revenue history stays accurate after price changes
- `FuelSale` and `Payment` are created in a single Prisma `$transaction` so they are always atomic

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database (local or [Neon](https://neon.tech) free tier)
- npm v8+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/flowstation.git
cd flowstation
```

### 2. Install all dependencies from the root

```bash
npm install
```

### 3. Set up environment variables

```bash
# apps/server/.env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/flowstation"
JWT_SECRET="your-secret-key-here"
```

```bash
# apps/client/.env
VITE_API_URL=
```

### 4. Run database migrations

```bash
cd apps/server
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed demo data (optional)

```bash
npx prisma db seed
```

> Note: Register an organisation first via the app or API before running the seed, as seed data requires an existing organisation.

### 6. Start both apps from the root

```bash
cd ../..
npm run dev
```

| App         | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:3000 |

---

## 🔌 API Endpoints

All routes except `/api/auth/register` and `/api/auth/login` require an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint             | Description                      |
| ------ | -------------------- | -------------------------------- |
| POST   | `/api/auth/register` | Register a new organisation      |
| POST   | `/api/auth/login`    | Login and receive JWT            |
| GET    | `/api/auth/me`       | Get current organisation details |

### Fuel Products

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/api/products`          | List all fuel products  |
| POST   | `/api/products/setup`    | Create a fuel product   |
| PUT    | `/api/products/edit/:id` | Update price or details |
| DELETE | `/api/products/:id`      | Remove a product        |

### Suppliers

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| GET    | `/api/suppliers`     | List all suppliers |
| POST   | `/api/suppliers/new` | Add a supplier     |
| DELETE | `/api/suppliers/:id` | Delete a supplier  |

### Fuel Stock

| Method | Endpoint             | Description                             |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/api/stock`         | All delivery records                    |
| GET    | `/api/stock/balance` | Current stock balance per fuel type     |
| GET    | `/api/stock/:id`     | Single delivery record                  |
| POST   | `/api/stock/new`     | Record a new delivery (stock increases) |

### Attendants

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | `/api/attendants`     | List all attendants      |
| POST   | `/api/attendants/new` | Register an attendant    |
| PUT    | `/api/attendants/:id` | Update attendant details |

### Sales

| Method | Endpoint         | Description                          |
| ------ | ---------------- | ------------------------------------ |
| GET    | `/api/sales`     | All sales records                    |
| GET    | `/api/sales/:id` | Single sale details                  |
| POST   | `/api/sales/new` | Record a fuel sale (stock decreases) |

### Customers

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| GET    | `/api/customers`               | List all customers              |
| POST   | `/api/customers/new`           | Register a customer             |
| PUT    | `/api/customers/edit/:id`      | Update a customer details       |
| GET    | `/api/customers/:id/purchases` | Purchase history for a customer |

### Daily Summary

| Method | Endpoint                       | Description             |
| ------ | ------------------------------ | ----------------------- |
| GET    | `/api/summary?date=YYYY-MM-DD` | Live summary for a date |
| POST   | `/api/summary/generate`        | Save end-of-day summary |
| GET    | `/api/summary/history`         | All saved summaries     |

---

> Built with Node.js, React, Prisma, and PostgreSQL as part of a group academic assignment.

---

## 📄 License

This project was built for academic purposes.

---

<div align="center">
  <p>Built with ⛽ by Group 2</p>
</div>

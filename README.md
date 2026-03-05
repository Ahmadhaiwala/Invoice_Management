# 🧾 Monefy — Invoice Management System

A full-stack invoice management application built with **Next.js** (frontend) and **Express + PostgreSQL** (backend).

## Features

- 🔐 Authentication (hardcoded: `admin` / `admin123`)
- 📋 Invoice list with search, status filter, and amount filter
- 📄 Invoice detail page with line items, totals, and payments
- 💳 Add payment modal with overpayment prevention
- ✅ Auto status update (DRAFT → PAID when fully paid)

---

## Prerequisites

- **Node.js** v18+
- **PostgreSQL** installed and running

---

## 🗄️ Database Setup

1. Open PostgreSQL and create the database:

```sql
CREATE DATABASE "InvoiceDB";
```

2. Connect to `InvoiceDB` and run these to create the tables:

```sql
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'PAID');

CREATE TABLE Invoice (
    id SERIAL PRIMARY KEY,
    invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
    customerName VARCHAR(100) NOT NULL,
    issueDate DATE NOT NULL,
    dueDate DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    amountPaid NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    balanceDue NUMERIC(12,2) GENERATED ALWAYS AS (total - amountPaid) STORED,
    isArchived BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE InvoiceLine (
    id SERIAL PRIMARY KEY,
    invoiceId INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unitPrice NUMERIC(12,2) NOT NULL CHECK (unitPrice >= 0),
    lineTotal NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unitPrice) STORED,
    CONSTRAINT fk_invoice_line FOREIGN KEY (invoiceId) REFERENCES Invoice(id)
);

CREATE TABLE Payment (
    id SERIAL PRIMARY KEY,
    invoiceId INT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    paymentDate DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoiceId) REFERENCES Invoice(id)
);
```

3. Insert sample data:

```sql
INSERT INTO Invoice (invoiceNumber, customerName, issueDate, dueDate, status, total, amountPaid) VALUES
('INV-1001', 'Rahul Sharma', '2026-03-01', '2026-03-10', 'PAID', 5000.00, 5000.00),
('INV-1002', 'Aisha Khan', '2026-03-02', '2026-03-12', 'DRAFT', 7500.00, 2000.00),
('INV-1003', 'John Mathew', '2026-03-03', '2026-03-13', 'PAID', 12000.00, 12000.00),
('INV-1004', 'Priya Patel', '2026-03-04', '2026-03-14', 'DRAFT', 3000.00, 1000.00),
('INV-1005', 'Ahmed Ali', '2026-03-05', '2026-03-15', 'PAID', 9800.00, 9800.00);

INSERT INTO InvoiceLine (invoiceId, description, quantity, unitPrice) VALUES
(1, 'Web Design', 2, 1500.00),
(1, 'SEO Optimization', 1, 2000.00),
(2, 'Logo Design', 1, 3000.00),
(2, 'Brand Guidelines', 1, 2500.00),
(2, 'Social Media Kit', 1, 2000.00),
(3, 'Mobile App Development', 1, 8000.00),
(3, 'API Integration', 1, 4000.00),
(4, 'Content Writing', 3, 500.00),
(4, 'Blog Setup', 1, 1500.00),
(5, 'E-commerce Setup', 1, 5800.00),
(5, 'Payment Gateway', 1, 4000.00);

INSERT INTO Payment (invoiceId, amount, paymentDate) VALUES
(1, 3000.00, '2026-03-02'),
(1, 2000.00, '2026-03-04'),
(2, 2000.00, '2026-03-03'),
(3, 12000.00, '2026-03-03'),
(4, 1000.00, '2026-03-04'),
(5, 9800.00, '2026-03-05');
```

4. Update `backend/db.js` with your PostgreSQL credentials:

```js
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "InvoiceDB",
  password: "YOUR_PASSWORD",
  port: 5432,
});
```

---

## 🚀 Running the App

### Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on **http://localhost:8000**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## 🔑 Login

| Username | Password |
| -------- | -------- |
| admin    | admin123 |

---

## API Endpoints

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| GET    | `/api/invoices`             | List all invoices  |
| GET    | `/api/invoice/:id`          | Get invoice by ID  |
| GET    | `/api/invoice/:id/lines`    | Get line items     |
| GET    | `/api/invoice/:id/payments` | Get payments       |
| POST   | `/api/invoice/:id/payments` | Add a payment      |
| POST   | `/api/invoice/:id/archive`  | Archive an invoice |
| POST   | `/api/invoice/:id/restore`  | Restore an invoice |

---

## Tech Stack

| Layer    | Technology                   |
| -------- | ---------------------------- |
| Frontend | Next.js, React, Tailwind CSS |
| Backend  | Express.js, Node.js          |
| Database | PostgreSQL                   |
| Icons    | Lucide React                 |

---


## ScreenShots

<img width="1853" height="960" alt="image" src="https://github.com/user-attachments/assets/96549371-1e73-43ab-9775-1cc3391240d9" />
<img width="1853" height="975" alt="image" src="https://github.com/user-attachments/assets/a05bb199-fa19-4b7d-9453-3da5f92c0074" />
<img width="1474" height="947" alt="image" src="https://github.com/user-attachments/assets/d2f57150-89b3-44aa-b8e5-e27004582eab" />



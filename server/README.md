# 🛠️ Multi-Vendor E-Commerce Backend

Backend API for a full-stack multi-vendor e-commerce platform built with modern technologies like GraphQL, TypeScript, and Prisma.

---

## 🚀 Tech Stack

* Node.js
* Express.js
* TypeScript
* Apollo GraphQL Server
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Razorpay Payment Integration

---

## 📦 Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Role-Based Access Control (RBAC)

  * ADMIN
  * VENDOR
  * CUSTOMER

---

### 🛍️ Product Management

* Create / Update / Delete products (Vendor)
* Category-based product organization
* Search, filter, and pagination

---

### 🧺 Cart System

* Add to cart
* Update quantity
* Remove items
* Clear cart

---

### 📦 Order Management

* Place order from cart
* Order items snapshot
* Order status lifecycle:

  * PENDING_PAYMENT
  * PAID
  * SHIPPED
  * DELIVERED
  * CANCELLED

---

### 💳 Payment Integration

* Razorpay payment gateway
* Create payment order
* Secure payment verification (HMAC SHA256)

---

### 👑 Admin Features

* Manage categories
* Monitor orders
* Role-based system control

---

### 🧑‍💼 Vendor Features

* Manage own products
* View orders for their products

---

## 🧱 Project Structure

```
src/
├── config/
├── context/
├── graphql/
│   ├── schema/
│   └── resolvers/
├── modules/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   └── payments/
├── middleware/
├── utils/
└── server.ts
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/multi-vendor-ecommerce.git
cd server
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Setup Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

### 4. Prisma Setup

```bash
npx prisma generate
npx prisma migrate dev
```

---

### 5. Run Server

```bash
npm run dev
```

Server runs at:

```
http://localhost:5000/graphql
```

---

## 🧪 Sample GraphQL Queries

### Register

```graphql
mutation {
  register(
    name: "User"
    email: "user@test.com"
    password: "123456"
    role: CUSTOMER
  ) {
    token
  }
}
```

---

### Login

```graphql
mutation {
  login(email: "user@test.com", password: "123456") {
    token
  }
}
```

---

### Get Products

```graphql
query {
  products {
    items {
      id
      name
      price
    }
  }
}
```

---

## 🔐 Security Practices

* Passwords hashed using bcrypt
* JWT for stateless authentication
* Role-based authorization middleware
* Payment signature verification using HMAC

---

## 🧠 Key Concepts Implemented

* Modular architecture (feature-based)
* Thin resolvers, fat services pattern
* Prisma ORM with type safety
* GraphQL schema design
* Transaction handling for orders
* RBAC + ownership validation

---

## 🚀 Future Improvements

* Image upload (Cloudinary / S3)
* Email/SMS notifications
* Refund handling
* Inventory alerts
* Microservices architecture

---

## 👨‍💻 Author

Built as a full-stack learning + portfolio project demonstrating scalable backend architecture and real-world e-commerce workflows.

---

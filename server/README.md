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
* Paid order refund flow on cancellation
* Email and SMS notifications for auth, order, payment, status, and refund events

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
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

APP_NAME=E-Commerce
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=info
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
REDIS_URL=redis://localhost:6379

# Optional. Without these, emails are logged in the server console.
# Gmail requires a Google App Password, not your normal Gmail password.
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
NOTIFICATION_FROM_EMAIL="E-Commerce <yourgmail@gmail.com>"

# Optional. Without these, SMS messages are logged in the server console.
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_PHONE=+10000000000
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
* Inventory alerts
* Microservices architecture

---

## 👨‍💻 Author

Built as a full-stack learning + portfolio project demonstrating scalable backend architecture and real-world e-commerce workflows.

---

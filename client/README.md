# 🎨 Multi-Vendor E-Commerce Frontend

Frontend application for a full-stack multi-vendor e-commerce platform built using React, TypeScript, and GraphQL.

---

## 🚀 Tech Stack

* React (Vite)
* TypeScript
* Apollo Client (GraphQL)
* React Router
* Tailwind CSS
* React Hook Form + Zod
* React Hot Toast

---

## 📦 Features

### 🔐 Authentication

* Login & Registration
* JWT-based authentication
* Persistent login using localStorage

---

### 🛍️ Product Browsing

* Product listing page
* Product details page
* Search, filter, and pagination
* Category-based browsing

---

### 🧺 Cart System

* Add to cart
* Update quantity
* Remove items
* Clear cart
* Cart total calculation

---

### 💳 Checkout & Payment

* Checkout flow
* Razorpay integration
* Payment verification
* Order success page

---

### 📦 Orders

* Order history page
* View previous orders and items

---

### 🧑‍💼 Vendor Dashboard

* Create product
* View own products
* Manage product inventory

---

### 👑 Admin Panel

* Category management
* Add new categories
* View system-level data

---

### 🎨 UI/UX Enhancements

* Toast notifications (success/error)
* Loading spinners
* Empty states
* Responsive design (mobile-friendly)

---

## 🧱 Project Structure

```id="1yhr9a"
src/
├── apollo/
├── components/
│   ├── common/
│   └── layout/
├── features/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── vendor/
│   └── admin/
├── hooks/
├── layouts/
├── routes/
├── utils/
└── main.tsx
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash id="2n9v3r"
git clone https://github.com/YOUR_USERNAME/multi-vendor-ecommerce.git
cd client
```

---

### 2. Install Dependencies

```bash id="z5lh2m"
npm install
```

---

### 3. Setup Environment Variables

Create `.env` file:

```env id="p0lg9z"
VITE_API_URL=http://localhost:5000/graphql
VITE_RAZORPAY_KEY_ID=your_key_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

---

### 4. Run Application

```bash id="j8w3tp"
npm run dev
```

App runs at:

```id="l1w4fd"
http://localhost:5173
```

---

## 🔗 API Integration

Frontend communicates with backend via GraphQL using Apollo Client.

```id="9z5kcf"
Apollo Client → GraphQL API → Backend
```

---

## 🔐 Authentication Flow

```id="8g0y6b"
Login/Register
   ↓
Receive JWT
   ↓
Store in localStorage
   ↓
Attach token via Apollo Link
   ↓
Authenticated requests
```

---

## 🧠 Key Concepts Implemented

* Feature-based folder structure
* GraphQL query/mutation handling
* Apollo Client caching
* Role-based UI rendering
* Protected routes
* Form handling with validation
* Modular component design

---

## 🎯 User Roles

```id="6x2w9n"
CUSTOMER → Browse, Cart, Orders
VENDOR  → Manage Products
ADMIN   → Manage Categories
```

---

## 🚀 Future Improvements

* Image upload (Cloudinary)
* Wishlist feature
* Reviews & ratings
* Global state optimization
* Skeleton loaders
* Dark mode

---

## 👨‍💻 Author

Built as part of a full-stack project demonstrating modern frontend architecture and real-world e-commerce functionality.

---

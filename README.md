# D Town Pizza - In-Store Digital Ordering System (MVP)

A custom, high-end, responsive digital ordering application designed specifically for customers dining inside the restaurant. This application replaces manual paper order-taking by allowing customers to customize pizzas and submit table orders digitally without requiring signups or account creation.

---

## 🚫 Features That Do NOT Exist (By Design)
This is **NOT** a home delivery system or standard e-commerce site. In compliance with the requirements, there is:
- **No Customer Accounts or Profiles** (100% guest checkouts only)
- **No Customer Login or Registration**
- **No Delivery, Drivers, or Shipping Options**
- **No Addresses or Push Notifications**

---

## 🍕 Core Portals & Features

### 1. Customer Ordering Portal
- **Organized Menu Browsing**: Instant client-side search and category filtering (Pizzas, Sides, Drinks, Desserts).
- **Interactive Pizza Customizer**: Select Size (Personal, Medium, Large), Crust (Classic Hand-Tossed, Thin, Deep Dish, Stuffed), Sauce, Toppings (meats, veggies, cheeses), and Add-ons. Prices update dynamically.
- **Quantity Dialogs**: Non-pizza items (wings, sodas) can be added to the cart with custom quantity values and special instructions (e.g. "no ice").
- **Guest Checkout**: Requires only the guest's name and optional phone number.
- **Live Order Tracker**: Displays a huge human-readable Token Number (e.g. `005`), estimated prep time (calculated dynamically based on pending queue size), and a live status progression bar (Received ➔ Preparing ➔ Ready ➔ Completed).

### 2. Kitchen Staff Dashboard (`/staff`)
- **Live Order Queue**: Real-time listing of active in-store orders.
- **Audio-Visual Alerts**: Plays a synthesized double-beep notification (via browser Web Audio API) whenever a new order is received.
- **Workflow Controllers**: Buttons to transition order statuses (Received ➔ Preparing ➔ Ready ➔ Collected).

### 3. Administration Control Center (`/admin`)
- **KPI Metrics**: Sales statistics showing total sales, average order value, today's revenue, order counts, and top 5 popular items.
- **Category & Listing CRUDs**: Panel to add or delete menu categories and menu food listings.
- **Pizza Factors CRUD**: Sub-editors to modify pricing factors for sizes, crusts, sauces, toppings, and add-ons.
- **User Account Management**: Form to create and manage credentials/roles for staff and admins.

---

## 🛠️ Technical Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: SQLite (local serverless file storage)
- **ORM**: Prisma ORM v6
- **Styling**: Vanilla CSS Modules (Glassmorphism theme, heat gradients, glows, custom scrollbars)
- **Session Management**: Cryptographic AES-256-GCM symmetric session cookies

---

## 🚀 Running the App

### 1. Launch local development server
Ensure dependencies are installed and run:
```bash
npm run dev
```

### 2. Default Access Credentials
To test staff and administrator portals, visit [http://localhost:3000/login](http://localhost:3000/login) and log in:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access to Administration Control and Kitchen Queue |
| **Staff** | `staff` | `staff123` | Kitchen Queue Dashboard only |

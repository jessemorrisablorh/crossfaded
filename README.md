# CrossFaded — The Ultimate Vibe Store

A modern, high-performance luxury e-commerce web application converted from Flutter to **React 19 + TypeScript + Vite + Tailwind CSS + Firebase**.

CrossFaded specializes in premium lifestyle accessories: medical-grade precision herb grinders, sculptural artisan ashtrays, aged vintage cigars, and smoking essentials.

---

## 🚀 Key Upgrades & Architectural Features

### 1. Brand Identity & Typography
- **Colors**: Deep obsidian black (`#000000`, `#09090b`), dark card backgrounds (`#141416`, `#18181b`), and vibrant gold/amber accents (`#f59e0b`, `#fbbf24`, `#d97706`).
- **Logo**: Striking `CROSSFADED` in Google Font **Anton**, featuring amber gold sheen.
- **Typography**: Google Fonts **Anton** (Brand & Hero), **Aldrich** (Product titles & Metrics), **Raleway** (Headings), **Poppins** (Body & UI), and **Open Sans** (Nav links).

### 2. High-Definition 4K Visuals
- Replaced low-resolution banners with curated **4K ultra-high-definition photography** directly showcasing:
  - Atmospheric cigar lounges with amber glow
  - Aerospace-grade CNC machined herb crushers
  - Vintage hand-rolled Cuban and Dominican cigars
  - Heavyweight concrete, brass, and crystal ashtrays
  - Stash bags and smoking accessories

### 3. Upgraded E-Commerce Flow
- **Hero Carousel**: Autoplay 4K slider with interactive navigation and responsive overlay banners.
- **"The Ultimate Vibe Store" Signature Equipment**: Interactive dual-tab showcase comparing Herb Grinders and Artisan Ashtrays with direct category filters.
- **Catalog & Shop**: Live search, category pills, price range filtering, sorting (Price, Rating, Featured).
- **Product Details & Gallery**: High-res image gallery, thumbnail switcher, stock status badges, technical specifications, and verified customer reviews.
- **Quick-View Modal**: Instant preview of any product without leaving the catalog.
- **Cart Experience**:
  - Real-time Firestore cart sync for logged-in users + localStorage persistence for guests.
  - Interactive slide-over **Cart Drawer** with free delivery progress indicator (unlocked at GHS 500).
  - Dedicated **Cart Page** with quantity steppers and custom delivery instructions note.
- **Fulfillment & Checkout**:
  - Seamless checkout flow capturing First & Last Name, Phone, Address, City, and Region (Greater Accra, Ashanti, Central, etc.).
  - Payment options: **Cash On Delivery (COD)** and **Mobile Money on Delivery**.
  - Direct order creation in Firestore `orders` collection + cart reset.
  - **Order Confirmation Page** with celebratory confetti burst (`canvas-confetti`) and one-click WhatsApp priority dispatch notification link.
- **Customer Accounts & Order History**:
  - View order history with real-time status pills (`pending`, `processing`, `delivered`, `cancelled`).
  - Saved billing details profile management.
- **Floating WhatsApp Concierge**: Instant direct chat button with pulsing indicator linked to `+233 54 323 6328`.
- **Administrative Suite**:
  - Protected Admin Portal (`/admin/*`) with role authentication check.
  - Real-time Analytics (Total Revenue, Orders, Active Catalog, Categories).
  - Product CRUD (Title, Price, Sale Price, Stock, Category, 4K Image URL, Featured toggle).
  - Category CRUD (Name, Slug, 4K Cover Photo, Description).
  - Order Fulfillment Manager (Change order status from pending to delivered).
  - Hero Sliders Manager (Add / delete 4K carousel banners).

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Gold Glow & Glassmorphism Utilities
- **State & Context**:
  - `AuthContext`: Firebase Auth & user profile
  - `CartContext`: Real-time Firestore sync & guest cache
  - `ProductContext`: Real-time Firestore collection stream & fallback seed data
  - `ToastContext`: Luxury slide-in notification alerts
- **Backend**: Firebase v11 (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Celebration Effects**: Canvas Confetti

---

## 💻 Running the Application

### Development Server
```bash
npm run dev
```
Runs at `http://localhost:3000`.

### Production Build
```bash
npm run build
```
Creates an optimized, chunked production bundle in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

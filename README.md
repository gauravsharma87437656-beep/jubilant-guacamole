# 🛍️ RentSquare — Premium Ethnic Wear Rental Platform

A full-stack rental marketplace for ethnic and traditional wear, built with **Next.js 16**, **Prisma**, **MySQL**, and **NextAuth.js**.

> 🌐 Live: [https://rentsquire.in](https://rentsquire.in)

---

## ✨ Features

- **Customer Portal** — Browse, search & rent ethnic wear with secure checkout
- **Vendor Dashboard** — Product management, order tracking, earnings & analytics
- **Admin Panel** — User management, vendor approvals, financial overview & disputes
- **Authentication** — Email/password & Google OAuth via NextAuth.js
- **Responsive Design** — Optimized for mobile, tablet & desktop
- **Real-time Search** — Filter by category, brand, price & availability

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | MySQL (Prisma ORM) |
| **Auth** | NextAuth.js v4 |
| **UI Components** | Radix UI, Lucide Icons |
| **State Management** | Zustand |
| **Email** | Resend |
| **Deployment** | Hostinger (Node.js) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MySQL database
- npm

### 1. Clone & Install

```bash
git clone https://github.com/gauravsharma87437656-beep/jubilant-guacamole.git
cd jubilant-guacamole
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Platform
NEXT_PUBLIC_PLATFORM_NAME="RentSquare"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   ├── dashboard/          # Admin, Vendor & Customer dashboards
│   ├── product/            # Product detail pages
│   └── page.tsx            # Homepage
├── components/             # Reusable UI components
│   ├── home/               # Homepage sections
│   ├── dashboard/          # Dashboard sidebars
│   ├── cart/               # Cart components
│   ├── shared/             # Navbar, Footer, etc.
│   └── ui/                 # Base UI components
├── lib/                    # Utilities (auth, prisma, helpers)
├── prisma/                 # Schema & seed data
├── store/                  # Zustand state management
└── types/                  # TypeScript type definitions
```

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| **Customer** | Browse, rent, manage orders & profile |
| **Vendor** | Product CRUD, order management, earnings tracking |
| **Admin** | Full platform control, vendor approvals, finance |

---

## 📦 Deployment (Hostinger)

1. Connect your GitHub repo in Hostinger's Node.js hosting
2. Set environment variables in the dashboard
3. Build command: `npm run build`
4. Start command: `npm start`

---

## 📄 License

This project is private and proprietary.

---

Built with ❤️ by the RentSquare Team

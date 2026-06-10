<div align="center">

<img src="https://img.shields.io/badge/Find%20Tounsi-Authentic%20Tunisian%20Products-E63946?style=for-the-badge&logoColor=white" alt="Find Tounsi Banner"/>

# 🇹🇳 Find Tounsi

### Discover, Verify & Promote Authentic Tunisian Products

*A platform that puts Tunisian craftsmanship and local brands on the map*

[![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-0.1.0-blue?style=for-the-badge)

</div>

---

## 📌 Overview

**Find Tounsi** is a mobile and web application for discovering, verifying, and promoting authentic Tunisian products. It helps consumers identify genuinely Tunisian-made goods across categories like food, crafts, clothing, and cosmetics — supporting local businesses and the Tunisian economy through technology.

> 🎯 **Mission:** Make it easy for every Tunisian (and the world) to find, trust, and buy products that are truly made in Tunisia.

---

## 🌟 Features

### 🔍 Discovery
- 🗂️ **Product Catalog** — Browse authentic products by category, region, and brand
- 🏷️ **Verified Badges** — Products verified as genuinely Tunisian-made
- 🌍 **Regional Map** — Discover products by governorate and local origin
- 🔎 **Smart Search** — Filter by category, brand, region, or keyword

### ✅ Verification
- 🤖 **AI Verification Agent** — Claude-powered agent to analyze and verify product authenticity
- 📋 **Brand Profiles** — Detailed pages for Tunisian brands with verification status
- 📊 **Authenticity Score** — Transparent scoring for each product

### 👤 User Features
- 🔐 **JWT Authentication** — Secure register & login
- ❤️ **Favorites** — Save products and brands you love
- 📝 **Reviews & Ratings** — Community-driven trust system

### 🛠️ Admin Features
- 📦 **Product Management** — Add, edit, verify, and remove products
- 🏢 **Brand Management** — Onboard and manage Tunisian brands
- 📈 **Analytics Dashboard** — Track platform usage and product performance

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend / Mobile** | Ionic 7 + React 18 + Capacitor |
| **Backend** | Node.js + Express.js |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 16 |
| **AI Agent** | Claude API (Anthropic) |
| **Auth** | JWT (JSON Web Tokens) |
| **Deployment** | Railway (backend) |
| **Mobile Build** | Capacitor (iOS & Android) |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────┐
│           Ionic React + Capacitor App             │
│        (Web Browser + iOS + Android)              │
└──────────────────────┬────────────────────────────┘
                       │ REST API (port 5000)
          ┌────────────▼────────────────┐
          │     Node.js + Express       │
          │      Backend API            │
          │  ┌──────────────────────┐   │
          │  │   Claude AI Agent    │   │
          │  │  (Product Verify)    │   │
          │  └──────────────────────┘   │
          └────────────┬────────────────┘
                       │ Prisma ORM
          ┌────────────▼────────────────┐
          │       PostgreSQL 16         │
          │  Users | Products | Brands  │
          │  Categories | Regions       │
          └─────────────────────────────┘
```

---

## 📁 Project Structure

```
FindTounsi/
├── frontend/                        # Ionic React app
│   ├── src/
│   │   ├── pages/                   # App screens
│   │   │   ├── Home/
│   │   │   ├── Products/
│   │   │   ├── Brands/
│   │   │   └── Auth/
│   │   ├── components/              # Reusable UI components
│   │   ├── services/                # API call functions
│   │   └── theme/                   # Ionic theme & variables
├── backend/                         # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── seed.js                  # Initial data seeder
│   ├── routes/
│   │   ├── auth.js                  # Register, login, /me
│   │   ├── products.js              # Product CRUD
│   │   ├── brands.js                # Brand CRUD
│   │   ├── categories.js            # Category routes
│   │   └── regions.js               # Region routes
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification
│   ├── .env.example                 # Environment template
│   └── server.js                    # Entry point
└── README.md
```

---

## 🗄️ Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  imageUrl    String?
  verified    Boolean  @default(false)
  category    Category @relation(fields: [categoryId], references: [id])
  brand       Brand    @relation(fields: [brandId], references: [id])
  region      Region   @relation(fields: [regionId], references: [id])
}

model Brand     { id Int @id; name String; verified Boolean }
model Category  { id Int @id; name String }
model Region    { id Int @id; name String }
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/Daycembhar2/FindTounsi.git
cd FindTounsi/backend
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/find_tounsi"
JWT_SECRET="your_secret_key"
PORT=5000
```

### 3. Install & migrate

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start the backend

```bash
npm run dev
# API running on http://localhost:5000
```

### 5. Start the frontend

```bash
cd ../frontend
npm install
ionic serve
# App running on http://localhost:8100
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login & get JWT | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/products` | List all products | ❌ |
| GET | `/api/products/:id` | Get product detail | ❌ |
| GET | `/api/brands` | List all brands | ❌ |
| GET | `/api/categories` | List categories | ❌ |
| GET | `/api/regions` | List regions | ❌ |

---

## 🌱 Seeded Data

The database comes pre-seeded with:

- ✅ **6 categories** — Food, Crafts, Clothing, Cosmetics, Electronics, Agriculture
- ✅ **7 Tunisian brands** — Verified local manufacturers
- ✅ **7 regions** — Tunis, Sfax, Sousse, Nabeul, Bizerte, Monastir, Gabès
- ✅ **8 authentic products** — One per major category

---

## 🗺️ Roadmap

- [x] Backend setup — Express + Prisma + PostgreSQL
- [x] JWT Authentication — Register, login, protected routes
- [x] Database seeding — Categories, brands, regions, products
- [ ] Frontend — Ionic React UI screens
- [ ] AI verification agent — Claude API integration
- [ ] Product image upload — Cloudinary integration
- [ ] Mobile build — Capacitor iOS & Android
- [ ] Deployment — Railway (backend) + Vercel (frontend)

---

## 👤 Author

**Bhar Daycem**
Full-Stack & Mobile Developer | Software Engineering Student

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/daycem-bhar)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Daycembhar2)

---

## 🤝 Contributing

Find Tounsi is a personal project currently in active development. Contributions, suggestions, and feedback are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ for Tunisia 🇹🇳 — Supporting local, going global</sub>
</div>

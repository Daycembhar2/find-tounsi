const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');


const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ──────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Route de test ────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message : '🇹🇳 Find Tounsi API is running!',
    version : '1.0.0',
    status  : 'OK',
    database: 'PostgreSQL connected ✅'
  });
});

// ── Test connexion base de données ───────────────────
app.get('/health', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const productsCount  = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const brandsCount    = await prisma.brand.count();
    res.json({
      status     : 'OK ✅',
      database   : 'PostgreSQL connected',
      products   : productsCount,
      categories : categoriesCount,
      brands     : brandsCount,
    });
  } catch (e) {
    res.status(500).json({ status: 'ERROR ❌', error: e.message });
  } finally {
    await prisma.$disconnect();
  }
});

// ── Routes API ───────────────────────────────────────
app.use('/api/products',   require('./routes/products.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/brands',     require('./routes/brands.routes'));
app.use('/api/regions',    require('./routes/map.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/scan', require('./routes/scan.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/missing-products', require('./routes/missing-products.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/favorites', require('./routes/favorites.routes'));
app.use('/api/sellers', require('./routes/sellers.routes'));
// ── Démarrage serveur ────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🇹🇳  Find Tounsi API');
  console.log('  ─────────────────────────────────');
  console.log(`  ✅  Server    → http://localhost:${PORT}`);
  console.log(`  🗄️   Database  → PostgreSQL (find_tounsi)`);
  console.log(`  📦  Env       → ${process.env.NODE_ENV || 'development'}`);
  console.log('  ─────────────────────────────────');
  console.log('');
});
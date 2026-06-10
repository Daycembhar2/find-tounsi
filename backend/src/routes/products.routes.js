const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// GET /api/products — tous les produits
router.get('/', async (req, res) => {
  try {
    const { limit, category, brand, search } = req.query;

    const where = {};

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (search) {
      where.OR = [
        { name        : { contains: search, mode: 'insensitive' } },
        { description : { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      take    : limit ? parseInt(limit) : undefined,
      include : {
        category : true,
        brand    : true,
        region   : true,
      },
      orderBy : { created_at: 'desc' },
    });

    res.json({ success: true, count: products.length, data: products });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/products/:id — un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where   : { id: req.params.id },
      include : { category: true, brand: true, region: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    res.json({ success: true, data: product });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/products/slug/:slug — un produit par slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where   : { slug: req.params.slug },
      include : { category: true, brand: true, region: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    res.json({ success: true, data: product });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// GET /api/categories — toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include : { _count: { select: { products: true } } },
      orderBy : { name: 'asc' },
    });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/categories/:slug — une catégorie avec ses produits
router.get('/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where   : { slug: req.params.slug },
      include : {
        products: {
          include : { brand: true, region: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Catégorie non trouvée' });
    }

    res.json({ success: true, data: category });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
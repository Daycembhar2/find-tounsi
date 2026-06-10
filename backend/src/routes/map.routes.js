const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// GET /api/regions — toutes les régions
router.get('/', async (req, res) => {
  try {
    const regions = await prisma.region.findMany({
      include : {
        products: {
          include : { category: true, brand: true },
        },
        _count: { select: { products: true } },
      },
      orderBy : { name: 'asc' },
    });
    res.json({ success: true, count: regions.length, data: regions });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/regions/:slug — une région avec ses produits
router.get('/:slug', async (req, res) => {
  try {
    const region = await prisma.region.findUnique({
      where   : { slug: req.params.slug },
      include : {
        products: {
          include : { category: true, brand: true },
        },
      },
    });

    if (!region) {
      return res.status(404).json({ success: false, error: 'Région non trouvée' });
    }

    res.json({ success: true, data: region });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
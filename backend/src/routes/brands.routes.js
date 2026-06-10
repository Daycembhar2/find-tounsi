const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// GET /api/brands — toutes les marques
router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include : { _count: { select: { products: true } } },
      orderBy : { name: 'asc' },
    });
    res.json({ success: true, count: brands.length, data: brands });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/brands/:slug — une marque avec ses produits
router.get('/:slug', async (req, res) => {
  try {
    const brand = await prisma.brand.findUnique({
      where   : { slug: req.params.slug },
      include : {
        products: {
          include : { category: true, region: true },
        },
      },
    });

    if (!brand) {
      return res.status(404).json({ success: false, error: 'Marque non trouvée' });
    }

    res.json({ success: true, data: brand });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
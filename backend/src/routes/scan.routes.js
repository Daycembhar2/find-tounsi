const express  = require('express');
const router   = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma   = new PrismaClient();
const { searchByBarcode, isTunisian } = require('../services/openFoodFacts.service');

// POST /api/scan/barcode
router.post('/barcode', async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success : false,
        error   : 'Code-barres requis'
      });
    }

    // 1 — Chercher dans notre base PostgreSQL d'abord
    const localProduct = await prisma.product.findUnique({
      where   : { barcode },
      include : { category: true, brand: true, region: true },
    });

    if (localProduct) {
      return res.json({
        success    : true,
        source     : 'local',
        is_tunisian: true,
        product    : localProduct,
        message    : '✅ Produit tunisien certifié — trouvé dans notre base !',
      });
    }

    // 2 — Chercher sur Open Food Facts
    const offProduct = await searchByBarcode(barcode);

    if (!offProduct) {
      return res.json({
        success     : true,
        source      : 'not_found',
        is_tunisian : false,
        product     : null,
        message     : '❓ Produit non trouvé — signalez-le si c\'est un produit tunisien',
      });
    }

    const tunisian = isTunisian(offProduct);

    return res.json({
      success     : true,
      source      : 'open_food_facts',
      is_tunisian : tunisian,
      product     : offProduct,
      message     : tunisian
        ? '✅ Produit tunisien détecté !'
        : '❌ Ce produit ne semble pas être tunisien',
    });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/scan/barcode/:barcode
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;

    // Chercher dans notre base d'abord
    const localProduct = await prisma.product.findUnique({
      where   : { barcode },
      include : { category: true, brand: true, region: true },
    });

    if (localProduct) {
      return res.json({
        success     : true,
        source      : 'local',
        is_tunisian : true,
        product     : localProduct,
        message     : '✅ Produit tunisien certifié !',
      });
    }

    // Chercher sur Open Food Facts
    const offProduct = await searchByBarcode(barcode);

    if (!offProduct) {
      return res.json({
        success     : true,
        source      : 'not_found',
        is_tunisian : false,
        product     : null,
        message     : '❓ Produit non trouvé',
      });
    }

    const tunisian = isTunisian(offProduct);

    return res.json({
      success     : true,
      source      : 'open_food_facts',
      is_tunisian : tunisian,
      product     : offProduct,
      message     : tunisian
        ? '✅ Produit tunisien détecté !'
        : '❌ Ce produit ne semble pas être tunisien',
    });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
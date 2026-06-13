const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');

const prisma = new PrismaClient();

// GET /api/favorites — liste des favoris de l'utilisateur connecté
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { user_id: req.user.id },
      include: {
        product: {
          include: { category: true, brand: true, region: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: favorites });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/favorites — ajouter un favori
router.post('/', auth, async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, error: 'product_id requis' });
    }

    const product = await prisma.product.findUnique({ where: { id: product_id } });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        user_id_product_id: {
          user_id: req.user.id,
          product_id,
        },
      },
      update: {},
      create: {
        user_id: req.user.id,
        product_id,
      },
      include: {
        product: {
          include: { category: true, brand: true, region: true },
        },
      },
    });

    res.status(201).json({ success: true, data: favorite });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/favorites/:productId — retirer un favori
router.delete('/:productId', auth, async (req, res) => {
  try {
    await prisma.favorite.deleteMany({
      where: {
        user_id: req.user.id,
        product_id: req.params.productId,
      },
    });

    res.json({ success: true, message: 'Favori retiré' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/favorites/check/:productId — vérifier si favori
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        user_id_product_id: {
          user_id: req.user.id,
          product_id: req.params.productId,
        },
      },
    });

    res.json({ success: true, isFavorite: !!favorite });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;

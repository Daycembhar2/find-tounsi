const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');

const prisma = new PrismaClient();

// POST /api/orders
router.post('/', auth, async (req, res) => {
  try {
    const { seller_id, items, delivery_address, delivery_city } = req.body;
    const user_id = req.user.id;

    if (!seller_id || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Données commande invalides' });
    }

    const total = items.reduce((sum, item) => {
      return sum + Number(item.unit_price) * Number(item.quantity);
    }, 0);

    const order = await prisma.order.create({
      data: {
        user_id,
        seller_id,
        order_number: `FT-${Date.now()}`,
        total_amount: total,
        delivery_address,
        delivery_city,
        order_items: {
          create: items.map((item) => ({
            product_id: item.product_id,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            total_price: Number(item.unit_price) * Number(item.quantity),
          })),
        },
      },
      include: {
        order_items: { include: { product: true } },
        seller: { select: { id: true, name: true, business_name: true } },
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/orders/me — commandes de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: req.user.id },
      include: {
        order_items: { include: { product: true } },
        seller: { select: { id: true, name: true, business_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/orders/seller/:sellerId
router.get('/seller/:sellerId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.sellerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    const orders = await prisma.order.findMany({
      where: { seller_id: req.params.sellerId },
      include: {
        order_items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/orders/:id — détail d'une commande
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        order_items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, business_name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    }

    if (order.user_id !== req.user.id && order.seller_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    res.json({ success: true, data: order });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    }

    if (existing.seller_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ success: true, data: order });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;

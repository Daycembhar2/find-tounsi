const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');

const prisma = new PrismaClient();

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// GET /api/products — tous les produits
router.get('/', async (req, res) => {
  try {
    const { limit, category, brand, search, seller_id } = req.query;

    const where = {};
    if (seller_id) where.seller_id = seller_id;
    if (category) where.category = { slug: category };
    if (brand) where.brand = { slug: brand };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      include: { category: true, brand: true, region: true, seller: { select: { id: true, name: true, business_name: true } } },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, count: products.length, data: products });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/products/slug/:slug — un produit par slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true, brand: true, region: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    res.json({ success: true, data: product });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/products — créer un produit (vendeur)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès réservé aux vendeurs' });
    }

    const {
      name,
      name_ar,
      description,
      price,
      stock,
      barcode,
      category_id,
      region_id,
      image_url,
      images,
      is_100_percent_tunisian,
      is_available,
    } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ success: false, error: 'Nom, description et prix sont requis' });
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        name_ar: name_ar || null,
        slug,
        description,
        price: Number(price),
        stock: stock !== undefined && stock !== '' ? Number(stock) : null,
        barcode: barcode || null,
        category_id: category_id || null,
        region_id: region_id || null,
        seller_id: req.user.id,
        image_url: image_url || null,
        images: images || [],
        is_100_percent_tunisian: is_100_percent_tunisian !== false,
        is_available: is_available !== false,
      },
      include: { category: true, brand: true, region: true },
    });

    res.status(201).json({ success: true, message: 'Produit créé', data: product });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/products/:id — un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        brand: true,
        region: true,
        seller: { select: { id: true, name: true, business_name: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    res.json({ success: true, data: product });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/products/:id — modifier un produit
router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    if (existing.seller_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    const {
      name,
      name_ar,
      description,
      price,
      stock,
      barcode,
      category_id,
      region_id,
      image_url,
      images,
      is_100_percent_tunisian,
      is_available,
    } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        name_ar: name_ar || null,
        description,
        price: price !== undefined ? Number(price) : null,
        stock: stock !== undefined && stock !== '' ? Number(stock) : null,
        barcode: barcode || null,
        category_id: category_id || null,
        region_id: region_id || null,
        image_url: image_url || null,
        images: images || [],
        is_100_percent_tunisian: Boolean(is_100_percent_tunisian),
        is_available: Boolean(is_available),
      },
      include: { category: true, brand: true, region: true },
    });

    res.json({ success: true, message: 'Produit mis à jour', data: product });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }

    if (existing.seller_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;

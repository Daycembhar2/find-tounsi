const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST /api/sellers/register — inscription vendeur
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      business_name,
      business_description,
      address,
      city,
      region,
    } = req.body;

    if (!name || !email || !password || !business_name) {
      return res.status(400).json({
        success: false,
        error: 'Nom, email, mot de passe et nom d\'entreprise sont requis',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SELLER',
        phone: phone || null,
        business_name,
        business_description: business_description || null,
        address: address || null,
        city: city || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        business_name: true,
        created_at: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Compte vendeur créé avec succès',
      user,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;

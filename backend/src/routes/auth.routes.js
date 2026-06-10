const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma   = new PrismaClient();

// ── POST /api/auth/register ───────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success : false,
        error   : 'Nom, email et mot de passe sont requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success : false,
        error   : 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si email existe déjà
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        success : false,
        error   : 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id         : true,
        name       : true,
        email      : true,
        role       : true,
        created_at : true,
      }
    });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success : true,
      message : '🎉 Compte créé avec succès !',
      token,
      user,
    });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success : false,
        error   : 'Email et mot de passe sont requis'
      });
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success : false,
        error   : 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success : false,
        error   : 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success : true,
      message : '✅ Connexion réussie !',
      token,
      user    : {
        id    : user.id,
        name  : user.name,
        email : user.email,
        role  : user.role,
      },
    });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────
router.get('/me', require('../middlewares/auth.middleware'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where  : { id: req.user.id },
      select : {
        id         : true,
        name       : true,
        email      : true,
        role       : true,
        created_at : true,
      }
    });

    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
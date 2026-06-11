const express  = require('express');
const router   = express.Router();
const { chat }   = require('../agents/assistant.agent');
const { verify } = require('../agents/verifier.agent');

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success : false,
        error   : 'messages[] requis'
      });
    }

    const reply = await chat(messages);
    res.json({ success: true, reply });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/ai/verify
router.post('/verify', async (req, res) => {
  try {
    const productInfo = req.body;

    if (!productInfo || !productInfo.name) {
      return res.status(400).json({
        success : false,
        error   : 'name du produit requis'
      });
    }

    const result = await verify(productInfo);
    res.json({ success: true, data: result });

  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
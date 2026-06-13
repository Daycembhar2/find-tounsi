const express = require("express")
const router = express.Router()
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

router.post("/", async (req, res) => {
  try {
    const { barcode, product_name, description, user_id } = req.body

    if (!barcode) {
      return res.status(400).json({
        success: false,
        error: "Code-barres requis",
      })
    }

    const report = await prisma.missingProductReport.create({
      data: {
        barcode,
        product_name: product_name || null,
        description: description || null,
        user_id: user_id || null,
      },
    })

    res.status(201).json({
      success: true,
      message: "Produit manquant signalé avec succès",
      data: report,
    })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

module.exports = router

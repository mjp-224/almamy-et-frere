// src/routes/detailCommandeRoutes.js
const express = require('express');
const router = express.Router();
const detailCommandeController = require('../controllers/detailCommandeController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, detailCommandeController.createDetailCommande);
router.get('/commande/:id_commande', authMiddleware, detailCommandeController.getDetailsByCommande); // ← ajouté

module.exports = router;
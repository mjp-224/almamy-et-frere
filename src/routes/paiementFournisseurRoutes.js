// src/routes/paiementFournisseurRoutes.js
const express = require('express');
const router = express.Router();
const paiementFournisseurController = require('../controllers/paiementFournisseurController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, paiementFournisseurController.createPaiementFournisseur);
router.get('/achat/:id_achat', authMiddleware, paiementFournisseurController.getPaiementsByAchat);

module.exports = router;
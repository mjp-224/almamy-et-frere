// src/routes/commandeClientRoutes.js
const express = require('express');
const router = express.Router();
const commandeClientController = require('../controllers/commandeClientController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, commandeClientController.createCommande);
router.get('/', authMiddleware, commandeClientController.getAllCommandes);
router.put('/:id/montant', authMiddleware, commandeClientController.updateMontantTotal); // ← ajouté

module.exports = router;
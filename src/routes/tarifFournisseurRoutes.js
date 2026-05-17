// src/routes/tarifFournisseurRoutes.js
const express = require('express');
const router = express.Router();
const tarifFournisseurController = require('../controllers/tarifFournisseurController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, tarifFournisseurController.createTarif);
router.get('/', authMiddleware, tarifFournisseurController.getAllTarifs);

// ✅ IMPORTANT : cette route doit être AVANT /:id pour éviter les conflits
router.get('/fournisseur/:id_fournisseur/produit/:id_produit', authMiddleware, tarifFournisseurController.getTarifByFournisseurProduit);

router.get('/:id', authMiddleware, tarifFournisseurController.getTarifById);
router.put('/:id', authMiddleware, tarifFournisseurController.updateTarif);
router.delete('/:id', authMiddleware, tarifFournisseurController.deleteTarif);

module.exports = router;
// src/routes/produitRoutes.js
const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, produitController.create);
router.get('/', authMiddleware, produitController.getAll);

// ✅ IMPORTANT : cette route doit être AVANT /:id
router.get('/fournisseur/:id_fournisseur', authMiddleware, produitController.getByFournisseur);

router.delete('/:id', authMiddleware, produitController.deleteProduit);
router.put('/:id', authMiddleware, produitController.updateProduit);

module.exports = router;
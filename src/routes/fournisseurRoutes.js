// src/routes/fournisseurRoutes.js
const express = require('express');
const router = express.Router();
const fournisseurController = require('../controllers/fournisseurController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, fournisseurController.createFournisseur);
router.get('/', authMiddleware, fournisseurController.getAllFournisseurs);
router.get('/:id', authMiddleware, fournisseurController.getFournisseurById);
router.put('/:id', authMiddleware, fournisseurController.updateFournisseur);
router.delete('/:id', authMiddleware, fournisseurController.deleteFournisseur);

module.exports = router;
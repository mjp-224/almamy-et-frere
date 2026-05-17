// src/routes/livraisonRoutes.js
const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');
const authMiddleware = require('../middlewares/auth');

router.get('/',    authMiddleware, livraisonController.getAllLivraisons);
router.get('/capacite/config', authMiddleware, livraisonController.getCapaciteLivraison);
router.post('/',   authMiddleware, livraisonController.createLivraison);
router.get('/:id', authMiddleware, livraisonController.getLivraisonById);
router.post('/:id/commandes', authMiddleware, livraisonController.addCommandeToLivraison);
router.put('/:id/statut',     authMiddleware, livraisonController.updateStatut);

module.exports = router;
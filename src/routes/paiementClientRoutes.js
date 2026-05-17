// src/routes/paiementClientRoutes.js
const express = require('express');
const router = express.Router();
const paiementClientController = require('../controllers/paiementClientController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, paiementClientController.getAllPaiements);
router.post('/', authMiddleware, paiementClientController.createPaiementClient);
router.get('/facture/:id_facture', authMiddleware, paiementClientController.getPaiementsByFacture);

module.exports = router;
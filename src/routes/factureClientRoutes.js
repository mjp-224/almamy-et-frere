// src/routes/factureClientRoutes.js
const express = require('express');
const router = express.Router();
const factureClientController = require('../controllers/factureClientController');

// GET toutes les factures
router.get('/', factureClientController.getAllFactures);

// GET une facture par id
router.get('/:id', factureClientController.getFactureById);

// POST créer une facture
router.post('/', factureClientController.createFacture);

module.exports = router;
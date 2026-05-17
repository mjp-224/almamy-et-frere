// src/routes/detailFactureRoutes.js
const express = require('express');
const router = express.Router();
const detailFactureController = require('../controllers/detailFactureController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, detailFactureController.createDetailFacture);
router.get('/facture/:id_facture', authMiddleware, detailFactureController.getDetailsByFactureId);

module.exports = router;
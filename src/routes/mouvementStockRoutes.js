// src/routes/mouvementStockRoutes.js
const express = require('express');
const router = express.Router();
const mouvementStockController = require('../controllers/mouvementStockController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, mouvementStockController.createMouvement);
router.get('/', authMiddleware, mouvementStockController.getAllMouvements);
router.get('/stock/:id_stock', authMiddleware, mouvementStockController.getMouvementsByStockId);
router.get('/:id', authMiddleware, mouvementStockController.getMouvementById);
router.delete('/:id', authMiddleware, mouvementStockController.deleteMouvement);

module.exports = router;
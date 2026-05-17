// src/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, stockController.createStock);
router.get('/', authMiddleware, stockController.getAllStocks);
router.get('/:id', authMiddleware, stockController.getStockById);
router.put('/:id', authMiddleware, stockController.updateStock);
router.delete('/:id', authMiddleware, stockController.deleteStock);

module.exports = router;
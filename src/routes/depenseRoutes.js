// src/routes/depenseRoutes.js
const express = require('express');
const router = express.Router();
const depenseController = require('../controllers/depenseController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, depenseController.createDepense);
router.get('/', authMiddleware, depenseController.getAllDepenses);
router.get('/:id', authMiddleware, depenseController.getDepenseById);
router.put('/:id', authMiddleware, depenseController.updateDepense);
router.delete('/:id', authMiddleware, depenseController.deleteDepense);

module.exports = router;
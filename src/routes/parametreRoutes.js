// src/routes/parametreRoutes.js
const express = require('express');
const router = express.Router();
const parametreController = require('../controllers/parametreController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, parametreController.create);
router.get('/', authMiddleware, parametreController.getAll);
router.get('/:id', authMiddleware, parametreController.getById);
router.put('/:id', authMiddleware, parametreController.update);

module.exports = router;
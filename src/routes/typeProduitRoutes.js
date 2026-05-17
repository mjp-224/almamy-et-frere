// src/routes/typeProduitRoutes.js
const express = require('express');
const router = express.Router();
const typeProduitController = require('../controllers/typeProduitController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, typeProduitController.createTypeProduit);
router.get('/', authMiddleware, typeProduitController.getAllTypeProduits);
router.get('/:id', authMiddleware, typeProduitController.getTypeProduitById);
router.put('/:id', authMiddleware, typeProduitController.updateTypeProduit);
router.delete('/:id', authMiddleware, typeProduitController.deleteTypeProduit);

module.exports = router;
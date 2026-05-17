// src/routes/detailAchatRoutes.js
const express = require('express');
const router = express.Router();
const detailAchatController = require('../controllers/detailAchatController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, detailAchatController.createDetailAchat);
router.get('/achat/:id_achat', authMiddleware, detailAchatController.getDetailsByAchatId);

module.exports = router;
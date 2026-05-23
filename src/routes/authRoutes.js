// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

// Routes d'authentification
router.post('/register', authMiddleware, roleMiddleware(1), authController.register);
router.post('/login', authController.login);

module.exports = router;
// src/routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

// Routes pour les rôles (réservées aux admins par exemple)
router.post('/', authMiddleware, roleMiddleware(1), roleController.createRole);   // ID_ROLE 1 = Admin
router.get('/', authMiddleware, roleController.getAllRoles);
router.get('/:id', authMiddleware, roleController.getRoleById);
router.put('/:id', authMiddleware, roleMiddleware(1), roleController.updateRole);
router.delete('/:id', authMiddleware, roleMiddleware(1), roleController.deleteRole);

module.exports = router;
// src/routes/utilisateurRoutes.js
const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

router.get('/',                authMiddleware,                        utilisateurController.getAllUtilisateurs);
router.get('/:id',             authMiddleware,                        utilisateurController.getUtilisateurById);
router.post('/',               authMiddleware, roleMiddleware(1),     utilisateurController.create);
router.put('/:id',             authMiddleware,                        utilisateurController.updateUtilisateur);
router.put('/:id/password',    authMiddleware,                        utilisateurController.changePassword);
router.put('/:id/statut',      authMiddleware, roleMiddleware(1),     utilisateurController.toggleStatut);

module.exports = router;
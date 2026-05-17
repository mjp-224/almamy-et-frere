// src/routes/bonusRoutes.js
const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonusController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, bonusController.getAllPolitiqueBonus);
router.post('/politique', authMiddleware, bonusController.createPolitiqueBonus);
router.get('/comptes', authMiddleware, bonusController.getAllComptesBonus);
router.get('/compte/:id_fournisseur', authMiddleware, bonusController.getCompteBonusByFournisseur);
router.get('/mouvements/:id_compte', authMiddleware, bonusController.getMouvementsByCompte);
router.post('/mouvement', authMiddleware, bonusController.createMouvementBonus);

module.exports = router;
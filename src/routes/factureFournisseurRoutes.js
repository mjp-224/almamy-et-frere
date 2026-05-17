// src/routes/factureFournisseurRoutes.js

const express = require('express');
const router = express.Router();

// ✅ IMPORT D'ABORD
const factureFournisseurController = require('../controllers/factureFournisseurController');
const authMiddleware = require('../middlewares/auth');
console.log(factureFournisseurController);

// ✅ ENSUITE LOG (si besoin)
console.log('uploadFacturePDF =', factureFournisseurController.uploadFacturePDF);

// ================= ROUTES =================
router.post('/import', authMiddleware, factureFournisseurController.uploadFacturePDF);

router.get('/', authMiddleware, factureFournisseurController.getAllFacturesFournisseur);
router.post('/', authMiddleware, factureFournisseurController.createFactureFournisseur);
router.get('/:id', authMiddleware, factureFournisseurController.getFactureFournisseurById);

module.exports = router;

// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import des middlewares
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

// Importation de toutes les routes
const authRoutes = require('./authRoutes');
const roleRoutes = require('./roleRoutes');
const utilisateurRoutes = require('./utilisateurRoutes');
const fournisseurRoutes = require('./fournisseurRoutes');
const clientRoutes = require('./clientRoutes');
const typeProduitRoutes = require('./typeProduitRoutes');
const produitRoutes = require('./produitRoutes');
const stockRoutes = require('./stockRoutes');
const mouvementStockRoutes = require('./mouvementStockRoutes');
const tarifFournisseurRoutes = require('./tarifFournisseurRoutes');
const achatRoutes = require('./achatRoutes');
const detailAchatRoutes = require('./detailAchatRoutes');
const bonusRoutes = require('./bonusRoutes');
const commandeClientRoutes = require('./commandeClientRoutes');
const detailCommandeRoutes = require('./detailCommandeRoutes');
const livraisonRoutes = require('./livraisonRoutes');
const factureClientRoutes = require('./factureClientRoutes');
const detailFactureRoutes = require('./detailFactureRoutes');
const factureFournisseurRoutes = require('./factureFournisseurRoutes');
const paiementClientRoutes = require('./paiementClientRoutes');
const paiementFournisseurRoutes = require('./paiementFournisseurRoutes');
const depenseRoutes = require('./depenseRoutes');
const parametreRoutes = require('./parametreRoutes');
const historiqueRoutes = require('./historiqueRoutes');

// Configuration des routes avec préfixes et protection

// Routes publiques (auth)
router.use('/auth', authRoutes);

// Routes pour Administrateur uniquement (ID_ROLE = 1)
router.use('/roles', authMiddleware, roleMiddleware(1), roleRoutes);
router.use('/utilisateurs', authMiddleware, roleMiddleware(1), utilisateurRoutes);
router.use('/parametres', authMiddleware, roleMiddleware(1), parametreRoutes);
router.use('/historique', authMiddleware, roleMiddleware(1), historiqueRoutes);
router.use('/depenses', authMiddleware, roleMiddleware(1), depenseRoutes);

// Routes pour Gestionnaire de Stock (ID_ROLE = 2 ou 7) + Admin
// Consultation seulement (pas d'ajout) sur fournisseurs, produits, tarifs
router.use('/fournisseurs', authMiddleware, roleMiddleware([1, 2, 7]), fournisseurRoutes);
router.use('/produits', authMiddleware, roleMiddleware([1, 2, 7]), produitRoutes);
router.use('/type-produits', authMiddleware, roleMiddleware([1, 2, 7]), typeProduitRoutes);
router.use('/stocks', authMiddleware, roleMiddleware([1, 2, 7]), stockRoutes);
router.use('/mouvements-stock', authMiddleware, roleMiddleware([1, 2, 7]), mouvementStockRoutes);
router.use('/tarifs-fournisseur', authMiddleware, roleMiddleware([1, 2, 7]), tarifFournisseurRoutes);
// Gestionnaire de stock N'A PAS accès aux achats et factures fournisseurs (admin seul)
router.use('/achats', authMiddleware, roleMiddleware([1]), achatRoutes);
router.use('/details-achat', authMiddleware, roleMiddleware([1]), detailAchatRoutes);
router.use('/factures-fournisseur', authMiddleware, roleMiddleware([1]), factureFournisseurRoutes);
router.use('/paiements-fournisseur', authMiddleware, roleMiddleware([1]), paiementFournisseurRoutes);
router.use('/bonus', authMiddleware, roleMiddleware([1]), bonusRoutes);

// Routes pour Gestionnaire des Ventes (ID_ROLE = 3) + Admin
router.use('/clients', authMiddleware, roleMiddleware([1, 3]), clientRoutes);
router.use('/commandes', authMiddleware, roleMiddleware([1, 3]), commandeClientRoutes);
router.use('/details-commande', authMiddleware, roleMiddleware([1, 3]), detailCommandeRoutes);
router.use('/livraisons', authMiddleware, roleMiddleware([1, 3]), livraisonRoutes);
router.use('/factures-client', authMiddleware, roleMiddleware([1, 3]), factureClientRoutes);
router.use('/details-facture', authMiddleware, roleMiddleware([1, 3]), detailFactureRoutes);
router.use('/paiements-client', authMiddleware, roleMiddleware([1, 3]), paiementClientRoutes);

module.exports = router;
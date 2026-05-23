// src/models/index.js
const pool = require('../config/database');

// Connexion pool
const db = pool;

// Fonction utilitaire pour exécuter des requêtes
const query = async (sql, params = []) => {
    try {
        const [rows] = await db.query(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
};

// Importation de tous les models
const Role = require('./Role');
const Utilisateur = require('./Utilisateur');
const Fournisseur = require('./Fournisseur');
const Client = require('./Client');
const TypeProduit = require('./TypeProduit');
const Produit = require('./Produit');
const StockMagasin = require('./StockMagasin');
const MouvementStock = require('./MouvementStock');
const TarifFournisseur = require('./TarifFournisseur');
const AchatUsine = require('./AchatUsine');
const FactureFournisseur = require('./FactureFournisseur');
const DetailAchat = require('./DetailAchat');
const PolitiqueBonus = require('./PolitiqueBonus');
const CompteBonusFournisseur = require('./CompteBonusFournisseur');
const MouvementBonusFournisseur = require('./MouvementBonusFournisseur');
const CommandeClient = require('./CommandeClient');
const DetailCommande = require('./DetailCommande');
const Livraison = require('./Livraison');
const LivraisonCommande = require('./LivraisonCommande');
const Facture = require('./Facture');
const DetailFacture = require('./DetailFacture');
const PaiementClient = require('./PaiementClient');
const PaiementFournisseur = require('./PaiementFournisseur');
const Parametre = require('./Parametre');
const HistoriqueAction = require('./HistoriqueAction');
const Depense = require('./Depense');

// Export de tout
module.exports = {
    db,
    query,
    
    // Models
    Role,
    Utilisateur,
    Fournisseur,
    Client,
    TypeProduit,
    Produit,
    StockMagasin,
    MouvementStock,
    TarifFournisseur,
    AchatUsine,
    FactureFournisseur,
    DetailAchat,
    PolitiqueBonus,
    CompteBonusFournisseur,
    MouvementBonusFournisseur,
    CommandeClient,
    DetailCommande,
    Livraison,
    LivraisonCommande,
    Facture,
    DetailFacture,
    PaiementClient,
    PaiementFournisseur,
    Parametre,
    HistoriqueAction,
    Depense
};
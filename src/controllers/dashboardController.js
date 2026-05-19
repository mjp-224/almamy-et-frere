// src/controllers/dashboardController.js
const pool = require('../config/database');

const dashboardController = {
  getStats: async (req, res) => {
    try {
      const [produits] = await pool.query('SELECT COUNT(*) as total FROM PRODUIT');
      const [fournisseurs] = await pool.query('SELECT COUNT(*) as total FROM FOURNISSEUR');
      const [clients] = await pool.query('SELECT COUNT(*) as total FROM CLIENT');
      
      const [stock] = await pool.query(`
        SELECT SUM(s.QUANTITE * p.POIDS_SAC) as poids_total_kg
        FROM STOCK_MAGASIN s
        JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
      `);

      const totalProduits = produits[0].total || produits[0].TOTAL || 0;
      const totalFournisseurs = fournisseurs[0].total || fournisseurs[0].TOTAL || 0;
      const totalClients = clients[0].total || clients[0].TOTAL || 0;
      const poidsTotalKg = stock[0].poids_total_kg || stock[0].POIDS_TOTAL_KG || 0;
      
      const poidsTotalTonnes = (poidsTotalKg / 1000).toFixed(1) + 'T';

      res.json({
        produits: totalProduits,
        fournisseurs: totalFournisseurs,
        clients: totalClients,
        stockTotal: poidsTotalTonnes
      });
    } catch (error) {
      console.error('Erreur récupération stats dashboard:', error);
      res.status(500).json({ message: 'Erreur récupération stats dashboard' });
    }
  }
};

module.exports = dashboardController;

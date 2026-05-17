// src/controllers/detailCommandeController.js
const pool = require('../config/database');
const parametresHelper = require('../utils/parametresHelper');

const detailCommandeController = {

  createDetailCommande: async (req, res) => {
    const { id_commande, id_produit, quantite, prix_unitaire, appliquer_marge, appliquer_transport } = req.body;
    
    try {
      // Récupérer les paramètres
      const margePourcent = parseFloat(await parametresHelper.getParametreWithDefault('MARGE_BENEFICIAIRE_POURCENT')) || 10;
      const transportChargeClient = parseInt(await parametresHelper.getParametreWithDefault('TRANSPORT_CHARGE_CLIENT')) || 1;
      const fraisTransportParSac = parseFloat(await parametresHelper.getParametreWithDefault('FRAIS_TRANSPORT_PAR_SAC')) || 0;
      const poidsSacKg = parseFloat(await parametresHelper.getParametreWithDefault('POIDS_SAC_KG')) || 50;
      
      let prixFinal = parseFloat(prix_unitaire);
      let montantTransport = 0;
      let detailsCalcul = {
        prix_initial: prixFinal,
        marge_appliquee: false,
        transport_applique: false
      };
      
      // Appliquer la marge bénéficiaire si demandé
      if (appliquer_marge !== false) {
        const marge = (prixFinal * margePourcent) / 100;
        prixFinal += marge;
        detailsCalcul.marge_appliquee = true;
        detailsCalcul.marge_pourcent = margePourcent;
        detailsCalcul.montant_marge = marge;
      }
      
      // Appliquer les frais de transport si demandé et si transport à charge du client
      if (appliquer_transport !== false && transportChargeClient === 1 && fraisTransportParSac > 0) {
        montantTransport = parseInt(quantite) * fraisTransportParSac;
        detailsCalcul.transport_applique = true;
        detailsCalcul.frais_transport_par_sac = fraisTransportParSac;
        detailsCalcul.montant_transport = montantTransport;
      }
      
      const montantTotalLigne = (prixFinal * parseInt(quantite)) + montantTransport;
      
      await pool.query(
        'INSERT INTO DETAIL_COMMANDE (ID_COMMANDE, ID_PRODUIT, QUANTITE, PRIX_UNITAIRE) VALUES (?, ?, ?, ?)',
        [id_commande, id_produit, quantite, prixFinal]
      );
      
      res.status(201).json({ 
        message: 'Détail commande ajouté avec succès',
        details_calcul: detailsCalcul,
        prix_unitaire_final: prixFinal,
        montant_transport: montantTransport,
        montant_total_ligne: montantTotalLigne,
        quantite: parseInt(quantite)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur ajout détail commande' });
    }
  },

  getDetailsByCommande: async (req, res) => {
    const { id_commande } = req.params;
    try {
      const [rows] = await pool.query(`
        SELECT
          dc.ID_DETAIL      AS id_detail,
          dc.ID_COMMANDE    AS id_commande,
          dc.ID_PRODUIT     AS id_produit,
          p.NOM             AS produit_nom,
          dc.QUANTITE       AS quantite,
          dc.PRIX_UNITAIRE  AS prix_unitaire,
          (dc.QUANTITE * dc.PRIX_UNITAIRE) AS montant_ligne
        FROM DETAIL_COMMANDE dc
        JOIN PRODUIT p ON dc.ID_PRODUIT = p.ID_PRODUIT
        WHERE dc.ID_COMMANDE = ?
      `, [id_commande]);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur récupération détails commande' });
    }
  }

};

module.exports = detailCommandeController;
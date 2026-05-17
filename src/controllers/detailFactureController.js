// src/controllers/detailFactureController.js
const pool = require('../config/database');
const historiqueHelper = require('../utils/historiqueHelper');

const detailFactureController = {
    createDetailFacture: async (req, res) => {
        console.log('🔥 ROUTE APPELÉE: POST /details-facture');
        console.log('📦 Body reçu:', req.body);
        
        const { id_facture, id_produit, quantite, prix_unitaire } = req.body;
        
        console.log('📝 Tentative création détail facture:', {
            id_facture, id_produit, quantite, prix_unitaire
        });

        try {
            // Vérifier que la facture existe
            const [factureCheck] = await pool.query(
                'SELECT ID_FACTURE FROM FACTURE WHERE ID_FACTURE = ?',
                [id_facture]
            );
            
            if (factureCheck.length === 0) {
                console.log('❌ Facture non trouvée:', id_facture);
                return res.status(404).json({ message: 'Facture non trouvée' });
            }
            
            console.log('✅ Facture trouvée, insertion en cours...');

            const [result] = await pool.query(
                'INSERT INTO DETAIL_FACTURE (ID_FACTURE, ID_PRODUIT, QUANTITE, PRIX_UNITAIRE) VALUES (?, ?, ?, ?)',
                [id_facture, id_produit, quantite, prix_unitaire]
            );
            
            console.log('✅ Détail facture créé avec ID:', result.insertId);
            
            // Enregistrer dans l'historique
            const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
            await historiqueHelper.logAction(
                id_utilisateur,
                'CREATION_DETAIL_FACTURE',
                `Détail facture #${result.insertId} créé - Facture #${id_facture}, Produit #${id_produit}, Qté: ${quantite}, Prix: ${prix_unitaire}`
            );

            res.status(201).json({
                message: 'Détail facture ajouté avec succès',
                id_detail: result.insertId
            });
        } catch (error) {
            console.error('❌ Erreur création détail facture:', error);
            res.status(500).json({ 
                message: 'Erreur lors de l\'ajout du détail facture', 
                error: error.message 
            });
        }
    },

    getDetailsByFactureId: async (req, res) => {
        const { id_facture } = req.params;

        try {
            const [details] = await pool.query(`
                SELECT df.*, p.NOM as produit_nom 
                FROM DETAIL_FACTURE df
                JOIN PRODUIT p ON df.ID_PRODUIT = p.ID_PRODUIT
                WHERE df.ID_FACTURE = ?
            `, [id_facture]);
            res.json(details);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération des détails facture' });
        }
    }
};

module.exports = detailFactureController;
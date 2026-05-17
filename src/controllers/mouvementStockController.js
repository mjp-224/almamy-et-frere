// src/controllers/mouvementStockController.js
const pool = require('../config/database');

const mouvementStockController = {

    // ✅ Créer un mouvement ET mettre à jour le stock automatiquement
    createMouvement: async (req, res) => {
        const { id_stock, type, quantite, montant } = req.body;

        if (!['ENTREE', 'SORTIE'].includes(type)) {
            return res.status(400).json({ message: 'Type doit être ENTREE ou SORTIE' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Vérifier le stock actuel
            const [stocks] = await connection.query(
                'SELECT QUANTITE FROM STOCK_MAGASIN WHERE ID_STOCK = ?', [id_stock]
            );
            if (stocks.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Stock non trouvé' });
            }

            const stockActuel = stocks[0].QUANTITE;

            // 2. Vérifier qu'une sortie ne dépasse pas le stock disponible
            if (type === 'SORTIE' && Number(quantite) > stockActuel) {
                await connection.rollback();
                return res.status(400).json({
                    message: `Stock insuffisant. Stock actuel : ${stockActuel} sacs`
                });
            }

            // 3. Enregistrer le mouvement avec montant
            const [result] = await connection.query(
                'INSERT INTO MOUVEMENT_STOCK (ID_STOCK, TYPE, QUANTITE, MONTANT) VALUES (?, ?, ?, ?)',
                [id_stock, type, quantite, montant || 0]
            );

            // 4. Mettre à jour le stock
            const newQuantite = type === 'ENTREE'
                ? stockActuel + Number(quantite)
                : stockActuel - Number(quantite);

            await connection.query(
                'UPDATE STOCK_MAGASIN SET QUANTITE = ? WHERE ID_STOCK = ?',
                [newQuantite, id_stock]
            );

            await connection.commit();

            res.status(201).json({
                message: 'Mouvement enregistré avec succès',
                id_mouvement: result.insertId,
                nouveau_stock: newQuantite
            });
        } catch (error) {
            await connection.rollback();
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de l\'enregistrement du mouvement' });
        } finally {
            connection.release();
        }
    },

    // Tous les mouvements
    getAllMouvements: async (req, res) => {
        try {
            const [mouvements] = await pool.query(`
                SELECT 
                    m.ID_MOUVEMENT      AS id_mouvement,
                    m.TYPE              AS type,
                    m.QUANTITE          AS quantite,
                    m.MONTANT           AS montant,
                    m.DATE_MOUVEMENT    AS date_mouvement,
                    m.ID_STOCK          AS id_stock,
                    p.NOM               AS produit_nom,
                    p.POIDS_SAC,
                    s.QUANTITE          AS stock_actuel
                FROM MOUVEMENT_STOCK m
                JOIN STOCK_MAGASIN s ON m.ID_STOCK = s.ID_STOCK
                JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
                ORDER BY m.DATE_MOUVEMENT DESC
            `);
            res.json(mouvements);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération des mouvements' });
        }
    },

    // Mouvements d'un stock spécifique
    getMouvementsByStockId: async (req, res) => {
        const { id_stock } = req.params;
        try {
            const [mouvements] = await pool.query(`
                SELECT m.*, p.NOM as produit_nom
                FROM MOUVEMENT_STOCK m
                JOIN STOCK_MAGASIN s ON m.ID_STOCK = s.ID_STOCK
                JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
                WHERE m.ID_STOCK = ?
                ORDER BY m.DATE_MOUVEMENT DESC
            `, [id_stock]);
            res.json(mouvements);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération des mouvements' });
        }
    },

    // Un mouvement par ID
    getMouvementById: async (req, res) => {
        const { id } = req.params;
        try {
            const [mouvements] = await pool.query(`
                SELECT m.*, p.NOM as produit_nom
                FROM MOUVEMENT_STOCK m
                JOIN STOCK_MAGASIN s ON m.ID_STOCK = s.ID_STOCK
                JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
                WHERE m.ID_MOUVEMENT = ?
            `, [id]);
            if (mouvements.length === 0) return res.status(404).json({ message: 'Mouvement non trouvé' });
            res.json(mouvements[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération du mouvement' });
        }
    },

    // Supprimer un mouvement
    deleteMouvement: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM MOUVEMENT_STOCK WHERE ID_MOUVEMENT = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Mouvement non trouvé' });
            res.json({ message: 'Mouvement supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la suppression du mouvement' });
        }
    }
};

module.exports = mouvementStockController;
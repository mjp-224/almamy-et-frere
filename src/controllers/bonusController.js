// src/controllers/bonusController.js
const pool = require('../config/database');
const historiqueHelper = require('../utils/historiqueHelper');

const bonusController = {
    // Récupérer toutes les politiques de bonus
    getAllPolitiqueBonus: async (req, res) => {
        try {
            const [politiques] = await pool.query(`
                SELECT pb.*, f.NOM as fournisseur_nom 
                FROM POLITIQUE_BONUS pb
                JOIN FOURNISSEUR f ON pb.ID_FOURNISSEUR = f.ID_FOURNISSEUR
                ORDER BY f.NOM
            `);
            res.json(politiques);
        } catch (error) {
            console.error('Erreur récupération politiques bonus:', error);
            res.status(500).json({ message: 'Erreur récupération politiques bonus' });
        }
    },

    // Politique Bonus
    createPolitiqueBonus: async (req, res) => {
        const { id_fournisseur, type_bonus, seuil, montant, unite, periode } = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO POLITIQUE_BONUS (ID_FOURNISSEUR, TYPE_BONUS, SEUIL, MONTANT, UNITE, PERIODE) VALUES (?, ?, ?, ?, ?, ?)',
                [id_fournisseur, type_bonus, seuil, montant, unite, periode]
            );
            
            // Enregistrer dans l'historique
            const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
            await historiqueHelper.logAction(
                id_utilisateur,
                'CREATION_POLITIQUE_BONUS',
                `Politique bonus #${result.insertId} créée pour fournisseur ID ${id_fournisseur}: ${type_bonus}`
            );
            
            res.status(201).json({ message: 'Politique bonus créée', id: result.insertId });
        } catch (error) {
            res.status(500).json({ message: 'Erreur création politique bonus' });
        }
    },

    // Récupérer tous les comptes bonus avec info fournisseur et solde calculé
    getAllComptesBonus: async (req, res) => {
        try {
            const [comptes] = await pool.query(`
                SELECT 
                    cbf.ID_COMPTE,
                    cbf.ID_FOURNISSEUR,
                    f.NOM as fournisseur_nom,
                    f.TELEPHONE,
                    f.EMAIL,
                    COALESCE(
                        SUM(CASE WHEN mb.TYPE = 'credit' THEN mb.MONTANT ELSE 0 END) -
                        SUM(CASE WHEN mb.TYPE = 'debit' THEN mb.MONTANT ELSE 0 END),
                        0
                    ) as SOLDE
                FROM COMPTE_BONUS_FOURNISSEUR cbf
                JOIN FOURNISSEUR f ON cbf.ID_FOURNISSEUR = f.ID_FOURNISSEUR
                LEFT JOIN MOUVEMENT_BONUS_FOURNISSEUR mb ON cbf.ID_COMPTE = mb.ID_COMPTE
                GROUP BY cbf.ID_COMPTE, cbf.ID_FOURNISSEUR, f.NOM, f.TELEPHONE, f.EMAIL
                ORDER BY f.NOM
            `);
            res.json(comptes);
        } catch (error) {
            console.error('Erreur récupération comptes bonus:', error);
            res.status(500).json({ message: 'Erreur récupération comptes bonus' });
        }
    },

    // Compte Bonus Fournisseur - créer si n'existe pas avec solde calculé
    getCompteBonusByFournisseur: async (req, res) => {
        const { id_fournisseur } = req.params;
        try {
            let [compte] = await pool.query(
                'SELECT * FROM COMPTE_BONUS_FOURNISSEUR WHERE ID_FOURNISSEUR = ?', 
                [id_fournisseur]
            );
            
            // Si le compte n'existe pas, le créer automatiquement
            if (compte.length === 0) {
                const [result] = await pool.query(
                    'INSERT INTO COMPTE_BONUS_FOURNISSEUR (ID_FOURNISSEUR, SOLDE) VALUES (?, 0)',
                    [id_fournisseur]
                );
                compte = [{ ID_COMPTE: result.insertId, ID_FOURNISSEUR: id_fournisseur, SOLDE: 0 }];
            } else {
                // Calculer le solde réel à partir des mouvements
                const [soldeCalcule] = await pool.query(`
                    SELECT 
                        COALESCE(
                            SUM(CASE WHEN TYPE = 'credit' THEN MONTANT ELSE 0 END) -
                            SUM(CASE WHEN TYPE = 'debit' THEN MONTANT ELSE 0 END),
                            0
                        ) as SOLDE_REEL
                    FROM MOUVEMENT_BONUS_FOURNISSEUR
                    WHERE ID_COMPTE = ?
                `, [compte[0].ID_COMPTE]);
                
                compte[0].SOLDE = soldeCalcule[0].SOLDE_REEL;
            }
            
            res.json(compte[0]);
        } catch (error) {
            console.error('Erreur récupération compte bonus:', error);
            res.status(500).json({ message: 'Erreur récupération compte bonus' });
        }
    },

    // Récupérer les mouvements d'un compte
    getMouvementsByCompte: async (req, res) => {
        const { id_compte } = req.params;
        try {
            const [mouvements] = await pool.query(`
                SELECT mb.*, 
                       COALESCE(a.DATE_ACHAT, mb.DATE_MOUVEMENT) as date_operation,
                       CASE 
                           WHEN mb.TYPE = 'credit' THEN 'Crédit (Bonus reçu)'
                           WHEN mb.TYPE = 'debit' THEN 'Débit (Bonus utilisé)'
                           ELSE mb.TYPE
                       END as type_libelle
                FROM MOUVEMENT_BONUS_FOURNISSEUR mb
                LEFT JOIN ACHAT_USINE a ON mb.ID_ACHAT = a.ID_ACHAT
                WHERE mb.ID_COMPTE = ?
                ORDER BY mb.DATE_MOUVEMENT DESC
            `, [id_compte]);
            res.json(mouvements);
        } catch (error) {
            console.error('Erreur récupération mouvements:', error);
            res.status(500).json({ message: 'Erreur récupération mouvements' });
        }
    },

    // Créer un mouvement (créditer ou débiter)
    createMouvementBonus: async (req, res) => {
        const { id_compte, id_achat, type, montant, description } = req.body;
        
        if (!id_compte || !type || !montant) {
            return res.status(400).json({ message: 'id_compte, type et montant sont obligatoires' });
        }

        // Convertir le montant en nombre décimal
        const montantDecimal = parseFloat(montant);
        if (isNaN(montantDecimal) || montantDecimal <= 0) {
            return res.status(400).json({ message: 'Le montant doit être un nombre positif' });
        }

        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Calculer le solde actuel à partir des mouvements
            const [soldeRows] = await connection.query(`
                SELECT 
                    COALESCE(
                        SUM(CASE WHEN TYPE = 'credit' THEN MONTANT ELSE 0 END) -
                        SUM(CASE WHEN TYPE = 'debit' THEN MONTANT ELSE 0 END),
                        0
                    ) as SOLDE_ACTUEL
                FROM MOUVEMENT_BONUS_FOURNISSEUR
                WHERE ID_COMPTE = ?
            `, [id_compte]);

            const soldeActuel = parseFloat(soldeRows[0].SOLDE_ACTUEL);
            let nouveauSolde;

            // 2. Calculer le nouveau solde selon le type
            if (type === 'credit') {
                nouveauSolde = soldeActuel + montantDecimal;
            } else if (type === 'debit') {
                if (soldeActuel < montantDecimal) {
                    await connection.rollback();
                    return res.status(400).json({ 
                        message: 'Solde insuffisant', 
                        solde_actuel: soldeActuel,
                        montant_demandé: montantDecimal 
                    });
                }
                nouveauSolde = soldeActuel - montantDecimal;
            } else {
                await connection.rollback();
                return res.status(400).json({ message: 'Type doit être "credit" ou "debit"' });
            }

            // 3. Mettre à jour le solde dans la table compte
            await connection.query(
                'UPDATE COMPTE_BONUS_FOURNISSEUR SET SOLDE = ? WHERE ID_COMPTE = ?',
                [nouveauSolde, id_compte]
            );

            // 4. Créer le mouvement
            const [result] = await connection.query(
                `INSERT INTO MOUVEMENT_BONUS_FOURNISSEUR 
                 (ID_COMPTE, ID_ACHAT, TYPE, MONTANT, DESCRIPTION) 
                 VALUES (?, ?, ?, ?, ?)`,
                [id_compte, id_achat || null, type, montantDecimal, description || null]
            );

            await connection.commit();

            // Enregistrer dans l'historique
            const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
            await historiqueHelper.logAction(
                id_utilisateur,
                type === 'credit' ? 'CREDIT_BONUS' : 'DEBIT_BONUS',
                `Mouvement ${type} de ${montantDecimal} GNF sur compte #${id_compte}. Solde: ${soldeActuel} -> ${nouveauSolde}`
            );

            res.status(201).json({
                message: `Mouvement ${type} créé avec succès`,
                id_mouvement: result.insertId,
                solde_avant: soldeActuel,
                solde_apres: nouveauSolde,
                montant: montantDecimal
            });

        } catch (error) {
            await connection.rollback();
            console.error('Erreur création mouvement:', error);
            res.status(500).json({ message: 'Erreur création mouvement bonus' });
        } finally {
            connection.release();
        }
    }
};

module.exports = bonusController;
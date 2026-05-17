// src/controllers/livraisonController.js
const pool = require('../config/database');
const parametresHelper = require('../utils/parametresHelper');

const livraisonController = {

    // ✅ Créer une livraison
    createLivraison: async (req, res) => {
        const { id_achat, date_livraison, statut } = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO LIVRAISON (ID_ACHAT, DATE_LIVRAISON, STATUT) VALUES (?, ?, ?)',
                [id_achat, date_livraison, statut || 'EN_COURS']
            );
            // Enregistrer dans l'historique
            const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
            await historiqueHelper.logAction(
                id_utilisateur,
                'CREATION_LIVRAISON',
                `Livraison #${result.insertId} créée pour achat #${id_achat}`
            );

            res.status(201).json({
                message: 'Livraison créée avec succès',
                id_livraison: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur création livraison' });
        }
    },

    // ✅ Toutes les livraisons
    getAllLivraisons: async (req, res) => {
        try {
            const [livraisons] = await pool.query(`
                SELECT
                    l.ID_LIVRAISON          AS id_livraison,
                    l.DATE_LIVRAISON        AS date_livraison,
                    l.STATUT                AS statut,
                    f.NOM                   AS fournisseur_nom,
                    COUNT(lc.ID_COMMANDE)   AS nb_commandes,
                    SUM(lc.QUANTITE)        AS quantite_totale
                FROM LIVRAISON l
                LEFT JOIN ACHAT_USINE a         ON l.ID_ACHAT = a.ID_ACHAT
                LEFT JOIN FOURNISSEUR f         ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
                LEFT JOIN LIVRAISON_COMMANDE lc ON l.ID_LIVRAISON = lc.ID_LIVRAISON
                GROUP BY l.ID_LIVRAISON, l.DATE_LIVRAISON, l.STATUT, f.NOM
                ORDER BY l.DATE_LIVRAISON DESC
            `);
            res.json(livraisons);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur récupération livraisons' });
        }
    },

    // ✅ Détail d'une livraison
    getLivraisonById: async (req, res) => {
        const { id } = req.params;
        try {
            const [livraisons] = await pool.query(`
                SELECT
                    l.ID_LIVRAISON      AS id_livraison,
                    l.DATE_LIVRAISON    AS date_livraison,
                    l.STATUT            AS statut,
                    l.ID_ACHAT          AS id_achat,
                    f.NOM               AS fournisseur_nom
                FROM LIVRAISON l
                LEFT JOIN ACHAT_USINE a ON l.ID_ACHAT = a.ID_ACHAT
                LEFT JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
                WHERE l.ID_LIVRAISON = ?
            `, [id]);

            if (livraisons.length === 0) {
                return res.status(404).json({ message: 'Livraison non trouvée' });
            }

            const [commandes] = await pool.query(`
                SELECT
                    lc.ID_COMMANDE          AS id_commande,
                    lc.QUANTITE             AS quantite_livree,
                    lc.DESTINATION          AS destination,
                    cl.NOM                  AS client_nom,
                    c.DATE_COMMANDE         AS date_commande,
                    c.MONTANT_TOTAL         AS montant_total,
                    c.STATUT                AS statut_commande,
                    GROUP_CONCAT(p.NOM SEPARATOR ', ') AS produits
                FROM LIVRAISON_COMMANDE lc
                JOIN COMMANDE_CLIENT c  ON lc.ID_COMMANDE = c.ID_COMMANDE
                JOIN CLIENT cl          ON c.ID_CLIENT = cl.ID_CLIENT
                LEFT JOIN DETAIL_COMMANDE dc ON c.ID_COMMANDE = dc.ID_COMMANDE
                LEFT JOIN PRODUIT p     ON dc.ID_PRODUIT = p.ID_PRODUIT
                WHERE lc.ID_LIVRAISON = ?
                GROUP BY lc.ID_COMMANDE, lc.QUANTITE, lc.DESTINATION, cl.NOM, c.DATE_COMMANDE, c.MONTANT_TOTAL, c.STATUT
            `, [id]);

            res.json({ livraison: livraisons[0], commandes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur récupération livraison' });
        }
    },

    // ✅ Ajouter une commande à une livraison avec DESTINATION
    addCommandeToLivraison: async (req, res) => {
        const { id } = req.params;
        const { id_commande, quantite, destination } = req.body;

        const dest = destination || 'CLIENT'; // CLIENT ou MAGASIN

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Récupérer les paramètres de livraison
            const maxSacs = parseInt(await parametresHelper.getParametreWithDefault('NB_SACS_LIVRAISON')) || 700;
            const maxTonnes = parseFloat(await parametresHelper.getParametreWithDefault('POIDS_LIVRAISON_TONNES')) || 35;
            const poidsSacKg = parseFloat(await parametresHelper.getParametreWithDefault('POIDS_SAC_KG')) || 50;

            // Calculer la quantité totale déjà dans la livraison
            const [existingQty] = await connection.query(
                'SELECT COALESCE(SUM(QUANTITE), 0) as total FROM LIVRAISON_COMMANDE WHERE ID_LIVRAISON = ?',
                [id]
            );
            const quantiteExistante = parseInt(existingQty[0].TOTAL) || parseInt(existingQty[0].total) || 0;
            const nouvelleQuantite = quantiteExistante + parseInt(quantite);

            // Vérifier si on dépasse la capacité max
            if (nouvelleQuantite > maxSacs) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: `Capacité maximale dépassée. Maximum: ${maxSacs} sacs (${maxTonnes} tonnes). Déjà présent: ${quantiteExistante} sacs, Tentative d'ajout: ${quantite} sacs`,
                    capacite_max_sacs: maxSacs,
                    capacite_max_tonnes: maxTonnes,
                    quantite_existante: quantiteExistante,
                    quantite_tentee: parseInt(quantite),
                    poids_par_sac_kg: poidsSacKg
                });
            }

            // Vérifier doublon
            const [existing] = await connection.query(
                'SELECT * FROM LIVRAISON_COMMANDE WHERE ID_LIVRAISON = ? AND ID_COMMANDE = ?',
                [id, id_commande]
            );
            if (existing.length > 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Cette commande est déjà dans la livraison' });
            }

            // Insérer dans LIVRAISON_COMMANDE
            await connection.query(
                'INSERT INTO LIVRAISON_COMMANDE (ID_LIVRAISON, ID_COMMANDE, QUANTITE, DESTINATION) VALUES (?, ?, ?, ?)',
                [id, id_commande, quantite, dest]
            );

            // Mettre à jour statut commande
            const statut = dest === 'MAGASIN' ? 'EN_STOCK' : 'LIVREE';
            await connection.query(
                'UPDATE COMMANDE_CLIENT SET STATUT = ? WHERE ID_COMMANDE = ?',
                [statut, id_commande]
            );

            // Si MAGASIN → créer une ENTREE dans MOUVEMENT_STOCK
            if (dest === 'MAGASIN') {
                // Récupérer les détails de la commande pour calculer le montant
                const [details] = await connection.query(`
                    SELECT dc.ID_PRODUIT, dc.QUANTITE, dc.PRIX_UNITAIRE,
                           s.ID_STOCK
                    FROM DETAIL_COMMANDE dc
                    JOIN STOCK_MAGASIN s ON dc.ID_PRODUIT = s.ID_PRODUIT
                    WHERE dc.ID_COMMANDE = ?
                `, [id_commande]);

                for (const detail of details) {
                    const montant = detail.QUANTITE * detail.PRIX_UNITAIRE;

                    // Enregistrer le mouvement ENTREE
                    await connection.query(
                        'INSERT INTO MOUVEMENT_STOCK (ID_STOCK, TYPE, QUANTITE, MONTANT) VALUES (?, ?, ?, ?)',
                        [detail.ID_STOCK, 'ENTREE', detail.QUANTITE, montant]
                    );

                    // Mettre à jour le stock
                    await connection.query(
                        'UPDATE STOCK_MAGASIN SET QUANTITE = QUANTITE + ? WHERE ID_STOCK = ?',
                        [detail.QUANTITE, detail.ID_STOCK]
                    );
                }
            }

            await connection.commit();
            
            // Calculer le poids total
            const poidsTotalKg = nouvelleQuantite * poidsSacKg;
            const poidsTotalTonnes = (poidsTotalKg / 1000).toFixed(2);
            
            // Enregistrer dans l'historique
            const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
            await historiqueHelper.logAction(
                id_utilisateur,
                'AJOUT_COMMANDE_LIVRAISON',
                `Commande #${id_commande} ajoutée à la livraison #${id} - ${quantite} sacs - Destination: ${dest}`
            );

            res.status(201).json({
                message: `Commande ajoutée à la livraison (destination: ${dest})`,
                destination: dest,
                quantite_totale: nouvelleQuantite,
                poids_total_kg: poidsTotalKg,
                poids_total_tonnes: parseFloat(poidsTotalTonnes),
                capacite_max_sacs: maxSacs,
                capacite_max_tonnes: maxTonnes,
                sacs_restants: maxSacs - nouvelleQuantite,
                tonnes_restantes: (maxTonnes - parseFloat(poidsTotalTonnes)).toFixed(2)
            });
        } catch (error) {
            await connection.rollback();
            console.error(error);
            res.status(500).json({ message: 'Erreur ajout commande à la livraison' });
        } finally {
            connection.release();
        }
    },

    // ✅ Mettre à jour le statut d'une livraison
    updateStatut: async (req, res) => {
        const { id } = req.params;
        const { statut } = req.body;
        try {
            await pool.query(
                'UPDATE LIVRAISON SET STATUT = ? WHERE ID_LIVRAISON = ?',
                [statut, id]
            );
            // Enregistrer dans l'historique
            const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
            await historiqueHelper.logAction(
                id_utilisateur,
                'MODIFICATION_STATUT_LIVRAISON',
                `Livraison #${id} - Statut changé en: ${statut}`
            );

            res.json({ message: 'Statut mis à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur mise à jour statut' });
        }
    },

    // ✅ Récupérer la capacité de livraison configurée
    getCapaciteLivraison: async (req, res) => {
        try {
            const maxSacs = parseInt(await parametresHelper.getParametreWithDefault('NB_SACS_LIVRAISON')) || 700;
            const maxTonnes = parseFloat(await parametresHelper.getParametreWithDefault('POIDS_LIVRAISON_TONNES')) || 35;
            const poidsSacKg = parseFloat(await parametresHelper.getParametreWithDefault('POIDS_SAC_KG')) || 50;
            
            res.json({
                max_sacs: maxSacs,
                max_tonnes: maxTonnes,
                poids_sac_kg: poidsSacKg,
                message: `Capacité maximale: ${maxSacs} sacs (${maxTonnes} tonnes, ${poidsSacKg}kg/sac)`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur récupération capacité' });
        }
    }
};

module.exports = livraisonController;
// src/utils/bonusHelper.js
const pool = require('../config/database');
const historiqueHelper = require('./historiqueHelper');

const getMultiplier = (tonnes) => {
    if (tonnes >= 25000) return 60000;
    if (tonnes >= 20000) return 45000;
    if (tonnes >= 15000) return 40000;
    if (tonnes >= 10000) return 30000;
    if (tonnes >= 5000) return 25000;
    if (tonnes >= 3000) return 20000;
    if (tonnes >= 501) return 15000;
    return 0; // Pas de bonus en dessous de 501 tonnes
};

const bonusHelper = {
    processBonusForFacture: async (id_facture, id_utilisateur) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Récupérer les détails de la facture avec les infos produit et fournisseur
            // On joint PRODUIT pour le poids, TYPE_PRODUIT pour filtrer (optionnel, mais utile), 
            // et TARIF_FOURNISSEUR pour trouver l'ID_FOURNISSEUR (on prend le premier fournisseur lié au produit)
            const [details] = await connection.query(`
                SELECT 
                    df.ID_PRODUIT, 
                    df.QUANTITE, 
                    p.POIDS_SAC,
                    (SELECT t.ID_FOURNISSEUR FROM TARIF_FOURNISSEUR t WHERE t.ID_PRODUIT = df.ID_PRODUIT LIMIT 1) as ID_FOURNISSEUR
                FROM DETAIL_FACTURE df
                JOIN PRODUIT p ON df.ID_PRODUIT = p.ID_PRODUIT
                WHERE df.ID_FACTURE = ?
            `, [id_facture]);

            if (details.length === 0) {
                await connection.release();
                return;
            }

            // 2. Regrouper par fournisseur
            const fournisseurVentes = {};
            for (const detail of details) {
                if (!detail.ID_FOURNISSEUR) continue; // Si le produit n'a pas de fournisseur défini
                
                const poidsSac = detail.POIDS_SAC || 50; // Par défaut 50kg
                const tonnes = (detail.QUANTITE * poidsSac) / 1000;

                if (!fournisseurVentes[detail.ID_FOURNISSEUR]) {
                    fournisseurVentes[detail.ID_FOURNISSEUR] = 0;
                }
                fournisseurVentes[detail.ID_FOURNISSEUR] += tonnes;
            }

            // 3. Pour chaque fournisseur, calculer le volume sur 3 mois et attribuer le bonus
            for (const id_fournisseur of Object.keys(fournisseurVentes)) {
                const tonnesCourantes = fournisseurVentes[id_fournisseur];
                if (tonnesCourantes <= 0) continue;

                // Récupérer le volume total vendu sur les 3 derniers mois pour CE fournisseur
                const [volumeRows] = await connection.query(`
                    SELECT SUM((df.QUANTITE * p.POIDS_SAC) / 1000) as total_tonnes
                    FROM FACTURE f
                    JOIN DETAIL_FACTURE df ON f.ID_FACTURE = df.ID_FACTURE
                    JOIN PRODUIT p ON df.ID_PRODUIT = p.ID_PRODUIT
                    WHERE f.DATE_FACTURE >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                      AND (SELECT t.ID_FOURNISSEUR FROM TARIF_FOURNISSEUR t WHERE t.ID_PRODUIT = df.ID_PRODUIT LIMIT 1) = ?
                `, [id_fournisseur]);

                const tonnes3Mois = parseFloat(volumeRows[0].total_tonnes || 0);

                // Déterminer le multiplicateur
                const multiplicateur = getMultiplier(tonnes3Mois);

                if (multiplicateur > 0) {
                    const bonusCalcule = tonnesCourantes * multiplicateur;

                    // S'assurer que le compte bonus fournisseur existe
                    let [compteRows] = await connection.query(
                        'SELECT ID_COMPTE, SOLDE FROM COMPTE_BONUS_FOURNISSEUR WHERE ID_FOURNISSEUR = ?',
                        [id_fournisseur]
                    );

                    let id_compte;
                    let soldeActuel = 0;

                    if (compteRows.length === 0) {
                        const [insertCompte] = await connection.query(
                            'INSERT INTO COMPTE_BONUS_FOURNISSEUR (ID_FOURNISSEUR, SOLDE) VALUES (?, ?)',
                            [id_fournisseur, bonusCalcule]
                        );
                        id_compte = insertCompte.insertId;
                    } else {
                        id_compte = compteRows[0].ID_COMPTE;
                        soldeActuel = parseFloat(compteRows[0].SOLDE);
                        // Mettre à jour le solde
                        await connection.query(
                            'UPDATE COMPTE_BONUS_FOURNISSEUR SET SOLDE = SOLDE + ? WHERE ID_COMPTE = ?',
                            [bonusCalcule, id_compte]
                        );
                    }

                    // Enregistrer le mouvement
                    const bonusParSac = multiplicateur / 20;
                    const description = `Bonus Facture #${id_facture} : ${tonnesCourantes.toFixed(2)}T * ${multiplicateur} GNF/T (soit ${bonusParSac} GNF/sac) | Vol. 3 mois: ${tonnes3Mois.toFixed(2)}T`;
                    await connection.query(
                        `INSERT INTO MOUVEMENT_BONUS_FOURNISSEUR 
                        (ID_COMPTE, TYPE, MONTANT, DESCRIPTION) 
                        VALUES (?, 'credit', ?, ?)`,
                        [id_compte, bonusCalcule, description]
                    );

                    // Historique
                    if (id_utilisateur) {
                        await historiqueHelper.logAction(
                            id_utilisateur,
                            'CREDIT_BONUS_AUTO',
                            `Bonus automatique de ${bonusCalcule} GNF crédité pour le fournisseur ID ${id_fournisseur} suite à la facture #${id_facture}`
                        );
                    }
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            console.error('Erreur lors du calcul du bonus automatique:', error);
            // On ne jette pas d'erreur pour ne pas bloquer la création de la facture
        } finally {
            connection.release();
        }
    }
};

module.exports = bonusHelper;

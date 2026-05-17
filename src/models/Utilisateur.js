// src/models/Utilisateur.js
const { query } = require('./index');
const bcrypt = require('bcryptjs');

const Utilisateur = {
    create: async (data) => {
        const { nom, prenom, email, mot_de_passe, telephone, id_role } = data;
        
        // Hash du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        const sql = `
            INSERT INTO UTILISATEUR 
            (NOM, PRENOM, EMAIL, MOT_DE_PASSE, TELEPHONE, ID_ROLE) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await query(sql, [nom, prenom, email, hashedPassword, telephone, id_role]);
        return result.insertId;
    },

    findByEmail: async (email) => {
        const sql = 'SELECT * FROM UTILISATEUR WHERE EMAIL = ? AND STATUT = 1';
        const results = await query(sql, [email]);
        return results[0];
    },

    findById: async (id) => {
        const sql = `
            SELECT u.*, r.NOM_ROLE 
            FROM UTILISATEUR u
            JOIN ROLE r ON u.ID_ROLE = r.ID_ROLE
            WHERE u.ID_UTILISATEUR = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    findAll: async () => {
        const sql = `
            SELECT u.ID_UTILISATEUR, u.NOM, u.PRENOM, u.EMAIL, u.TELEPHONE, 
                   u.DATE_CREATION, u.STATUT, r.NOM_ROLE
            FROM UTILISATEUR u
            JOIN ROLE r ON u.ID_ROLE = r.ID_ROLE
            ORDER BY u.NOM, u.PRENOM
        `;
        return await query(sql);
    },

    update: async (id, data) => {
        const { nom, prenom, email, telephone, id_role, statut } = data;
        const sql = `
            UPDATE UTILISATEUR 
            SET NOM = ?, PRENOM = ?, EMAIL = ?, TELEPHONE = ?, 
                ID_ROLE = ?, STATUT = ?
            WHERE ID_UTILISATEUR = ?
        `;
        const [result] = await query(sql, [nom, prenom, email, telephone, id_role, statut, id]);
        return result.affectedRows;
    },

    changePassword: async (id, nouveauMotDePasse) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nouveauMotDePasse, salt);

        const sql = 'UPDATE UTILISATEUR SET MOT_DE_PASSE = ? WHERE ID_UTILISATEUR = ?';
        const [result] = await query(sql, [hashedPassword, id]);
        return result.affectedRows;
    },

    toggleStatut: async (id, statut) => {
        const sql = 'UPDATE UTILISATEUR SET STATUT = ? WHERE ID_UTILISATEUR = ?';
        const [result] = await query(sql, [statut, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM UTILISATEUR WHERE ID_UTILISATEUR = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = Utilisateur;
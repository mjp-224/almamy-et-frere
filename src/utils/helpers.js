// src/utils/helpers.js
const helpers = {};

/**
 * Formate une date au format YYYY-MM-DD
 */
helpers.formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Calcule le montant total d'une ligne (quantité × prix unitaire)
 */
helpers.calculateMontantLigne = (quantite, prixUnitaire) => {
    return (quantite || 0) * (prixUnitaire || 0);
};

/**
 * Génère un numéro de document (ex: CMD-20260410-0001)
 */
helpers.generateDocumentNumber = (prefix) => {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
                    String(now.getMonth() + 1).padStart(2, '0') +
                    String(now.getDate()).padStart(2, '0');
    
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${random}`;
};

/**
 * Vérifie si le stock est suffisant
 */
helpers.isStockSufficient = (stockActuel, quantiteDemandee) => {
    return stockActuel >= quantiteDemandee;
};

/**
 * Retourne le statut en français (optionnel)
 */
helpers.getStatutLabel = (statut) => {
    const labels = {
        'EN_COURS': 'En cours',
        'LIVREE': 'Livrée',
        'PAYEE': 'Payée',
        'ANNULEE': 'Annulée',
        'VALIDEE': 'Validée'
    };
    return labels[statut] || statut;
};

module.exports = helpers;
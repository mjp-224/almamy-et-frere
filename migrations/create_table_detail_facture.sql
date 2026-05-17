-- Script SQL pour créer la table DETAIL_FACTURE
-- Vérifie d'abord si la table existe

CREATE TABLE IF NOT EXISTS DETAIL_FACTURE (
    ID_DETAIL INT(11) NOT NULL AUTO_INCREMENT,
    ID_FACTURE INT(11) NOT NULL,
    ID_PRODUIT INT(11) NOT NULL,
    QUANTITE INT(11) NOT NULL DEFAULT 1,
    PRIX_UNITAIRE DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (ID_DETAIL),
    INDEX idx_facture (ID_FACTURE),
    INDEX idx_produit (ID_PRODUIT)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message de confirmation
SELECT 'Table DETAIL_FACTURE créée avec succès (ou déjà existante)' AS message;

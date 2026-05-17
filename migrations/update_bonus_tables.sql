-- Migration pour mettre à jour les tables bonus
-- À exécuter sur la base de données afdatabase

-- 1. Ajouter la colonne DESCRIPTION à la table mouvement_bonus_fournisseur
ALTER TABLE mouvement_bonus_fournisseur 
ADD COLUMN IF NOT EXISTS DESCRIPTION TEXT NULL 
AFTER MONTANT;

-- 2. Vérifier/créer les tables si elles n'existent pas

-- Table COMPTE_BONUS_FOURNISSEUR (si pas encore créée)
CREATE TABLE IF NOT EXISTS compte_bonus_fournisseur (
  ID_COMPTE int NOT NULL AUTO_INCREMENT,
  ID_FOURNISSEUR int DEFAULT NULL,
  SOLDE decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (ID_COMPTE),
  KEY ID_FOURNISSEUR (ID_FOURNISSEUR)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table POLITIQUE_BONUS (si pas encore créée)
CREATE TABLE IF NOT EXISTS politique_bonus (
  ID_POLITIQUE int NOT NULL AUTO_INCREMENT,
  ID_FOURNISSEUR int DEFAULT NULL,
  TYPE_BONUS varchar(30) DEFAULT NULL,
  SEUIL decimal(15,2) DEFAULT NULL,
  MONTANT decimal(15,2) DEFAULT NULL,
  UNITE varchar(20) DEFAULT NULL,
  PERIODE varchar(20) DEFAULT NULL,
  PRIMARY KEY (ID_POLITIQUE),
  KEY ID_FOURNISSEUR (ID_FOURNISSEUR)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table MOUVEMENT_BONUS_FOURNISSEUR (si pas encore créée)
CREATE TABLE IF NOT EXISTS mouvement_bonus_fournisseur (
  ID_MOUVEMENT int NOT NULL AUTO_INCREMENT,
  ID_COMPTE int DEFAULT NULL,
  ID_ACHAT int DEFAULT NULL,
  TYPE varchar(20) DEFAULT NULL,
  MONTANT decimal(15,2) DEFAULT NULL,
  DESCRIPTION TEXT NULL,
  DATE_MOUVEMENT timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID_MOUVEMENT),
  KEY ID_COMPTE (ID_COMPTE),
  KEY ID_ACHAT (ID_ACHAT)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Créer les comptes bonus pour les fournisseurs existants s'ils n'en ont pas
INSERT INTO compte_bonus_fournisseur (ID_FOURNISSEUR, SOLDE)
SELECT f.ID_FOURNISSEUR, 0.00
FROM fournisseur f
LEFT JOIN compte_bonus_fournisseur cbf ON f.ID_FOURNISSEUR = cbf.ID_FOURNISSEUR
WHERE cbf.ID_COMPTE IS NULL;

-- Message de confirmation
SELECT 'Migration terminée avec succès !' AS message;

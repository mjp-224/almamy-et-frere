-- Fix pour la table PARAMETRE
-- Assure que NOM est unique pour éviter les doublons

-- Vérifier et ajouter la contrainte UNIQUE sur NOM si elle n'existe pas
ALTER TABLE PARAMETRE 
ADD CONSTRAINT IF NOT EXISTS uk_parametre_nom UNIQUE (NOM);

-- Message de confirmation
SELECT 'Table PARAMETRE mise à jour avec contrainte UNIQUE sur NOM' AS message;

-- Vérifier si la table DETAIL_FACTURE existe et sa structure

-- 1. Vérifier si la table existe
SHOW TABLES LIKE 'DETAIL_FACTURE';

-- 2. Si elle existe, voir sa structure
DESCRIBE DETAIL_FACTURE;

-- 3. Vérifier les données
SELECT * FROM DETAIL_FACTURE LIMIT 5;

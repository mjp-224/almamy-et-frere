-- Vérifier si les tables existent et leur structure

-- 1. Vérifier DETAIL_FACTURE
SELECT 'DETAIL_FACTURE' as table_name, COUNT(*) as nb_lignes FROM DETAIL_FACTURE;

-- 2. Vérifier DETAIL_COMMANDE
SELECT 'DETAIL_COMMANDE' as table_name, COUNT(*) as nb_lignes FROM DETAIL_COMMANDE;

-- 3. Voir un exemple de détail commande
SELECT * FROM DETAIL_COMMANDE LIMIT 3;

-- 4. Vérifier la structure de DETAIL_FACTURE
DESCRIBE DETAIL_FACTURE;

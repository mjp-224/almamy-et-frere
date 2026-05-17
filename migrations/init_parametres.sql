-- Initialisation des paramètres de l'entreprise
-- À exécuter une seule fois pour créer les paramètres par défaut

-- Valeurs configurées selon les règles de l'entreprise:
-- 35 tonnes par livraison = 700 sacs (50kg chacun)
-- Transport à la charge du client
-- Marge bénéficiaire modifiable

-- Vérifier si les paramètres existent déjà, sinon les créer

-- 1. Poids par livraison en tonnes (35 tonnes)
INSERT INTO PARAMETRE (NOM, VALEUR, DESCRIPTION)
SELECT 'POIDS_LIVRAISON_TONNES', '35', 'Poids maximum par livraison en tonnes (35 tonnes = 700 sacs)'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PARAMETRE WHERE NOM = 'POIDS_LIVRAISON_TONNES');

-- 2. Nombre de sacs par livraison (700 sacs, calculé depuis 35 tonnes / 50kg)
INSERT INTO PARAMETRE (NOM, VALEUR, DESCRIPTION)
SELECT 'NB_SACS_LIVRAISON', '700', 'Nombre de sacs par livraison maximum'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PARAMETRE WHERE NOM = 'NB_SACS_LIVRAISON');

-- 3. Poids d''un sac en kg (50kg standard ciment)
INSERT INTO PARAMETRE (NOM, VALEUR, DESCRIPTION)
SELECT 'POIDS_SAC_KG', '50', 'Poids d''un sac de ciment en kg (standard: 50kg)'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PARAMETRE WHERE NOM = 'POIDS_SAC_KG');

-- 4. Marge bénéficiaire en pourcentage (modifiable selon besoin)
INSERT INTO PARAMETRE (NOM, VALEUR, DESCRIPTION)
SELECT 'MARGE_BENEFICIAIRE_POURCENT', '15', 'Marge bénéficiaire en pourcentage sur les ventes (modifiable)'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PARAMETRE WHERE NOM = 'MARGE_BENEFICIAIRE_POURCENT');

-- 5. Transport à charge du client (1 = oui, le client paie le transport)
INSERT INTO PARAMETRE (NOM, VALEUR, DESCRIPTION)
SELECT 'TRANSPORT_CHARGE_CLIENT', '1', 'Transport à la charge du client (1 = oui, 0 = non) - Modifiable'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PARAMETRE WHERE NOM = 'TRANSPORT_CHARGE_CLIENT');

-- 6. Frais de transport par sac (en GNF) - 0 si gratuit, modifiable
INSERT INTO PARAMETRE (NOM, VALEUR, DESCRIPTION)
SELECT 'FRAIS_TRANSPORT_PAR_SAC', '5000', 'Frais de transport par sac en GNF (0 si gratuit) - Modifiable'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM PARAMETRE WHERE NOM = 'FRAIS_TRANSPORT_PAR_SAC');

-- Mettre à jour si les valeurs existent déjà (pour s'assurer des bonnes valeurs)
UPDATE PARAMETRE SET VALEUR = '35', DESCRIPTION = 'Poids maximum par livraison en tonnes (35 tonnes = 700 sacs)' WHERE NOM = 'POIDS_LIVRAISON_TONNES';
UPDATE PARAMETRE SET VALEUR = '700', DESCRIPTION = 'Nombre de sacs par livraison maximum' WHERE NOM = 'NB_SACS_LIVRAISON';
UPDATE PARAMETRE SET VALEUR = '50', DESCRIPTION = 'Poids d''un sac de ciment en kg (standard: 50kg)' WHERE NOM = 'POIDS_SAC_KG';
UPDATE PARAMETRE SET VALEUR = '15', DESCRIPTION = 'Marge bénéficiaire en pourcentage sur les ventes (modifiable)' WHERE NOM = 'MARGE_BENEFICIAIRE_POURCENT';
UPDATE PARAMETRE SET VALEUR = '1', DESCRIPTION = 'Transport à la charge du client (1 = oui, 0 = non) - Modifiable' WHERE NOM = 'TRANSPORT_CHARGE_CLIENT';
UPDATE PARAMETRE SET VALEUR = '5000', DESCRIPTION = 'Frais de transport par sac en GNF (0 si gratuit) - Modifiable' WHERE NOM = 'FRAIS_TRANSPORT_PAR_SAC';

-- Message de confirmation
SELECT 'Paramètres initialisés/mis à jour avec succès !' AS message;

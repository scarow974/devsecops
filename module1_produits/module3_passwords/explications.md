# Module 3 – Vérification Mots de Passe Compromis

## Objectif
Vérifier si un mot de passe figure dans la base publique de 600M+ credentials compromis.

## Fonctionnalités
- Hachage SHA-1 du mot de passe
- Requête à l’API PwnedPasswords
- Alerte si compromis

## Bonnes pratiques
- Utiliser la k-anonymité (envoi uniquement des 5 premiers caractères du hash)
- Ne jamais stocker les mots de passe testés

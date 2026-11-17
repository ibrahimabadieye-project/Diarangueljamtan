# Déploiement de Diaranguel Jam Tan sur Render

Cette configuration conserve SQLite sur un disque persistant Render monté dans `/var/data`.
Elle ne déploie pas automatiquement le projet : elle prépare les fichiers nécessaires au déploiement.

## Avant de publier

1. Créer un dépôt Git privé et y envoyer le contenu du projet, sans `.env`, sans base de données et sans historique Git d'origine.
2. Dans Render, créer un **Blueprint** à partir du dépôt et sélectionner `render.yaml`.
3. Renseigner les variables demandées dans Render :
   - `ADMIN_CODE` : code administrateur long et unique (au moins 8 caractères).
   - `ADMIN_SECRET` : secret aléatoire long (au moins 48 caractères). Générer avec `openssl rand -hex 32`.
   - `VILLAGE_CODE` : code privé communiqué aux habitants concernés.
   - `NEXT_PUBLIC_SITE_URL` : URL Render attribuée au service après sa création ; mettre à jour puis redéployer.
4. Vérifier que le disque persistant est monté sur `/var/data` et que `DATABASE_URL` vaut `file:/var/data/custom.db`.
5. Déployer et contrôler les journaux de démarrage et le chemin `/`.

## Données

- Ne jamais lancer le script `seed` en production : il crée des données de démonstration.
- Importer les données réelles uniquement après validation et sauvegarde.
- La base SQLite doit rester sur le disque persistant `/var/data`.
- Le script `db:backup` écrit maintenant ses sauvegardes à côté de la base configurée. Prévoir aussi une copie hors de Render.
- Les changements de schéma doivent être sauvegardés et testés avant déploiement.

## Limites et coûts

Le disque persistant et l'instance Render peuvent être payants selon le plan choisi. Vérifier les tarifs et régions disponibles sur le site Render avant validation.

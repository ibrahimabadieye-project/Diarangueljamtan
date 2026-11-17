# Diaranguel — Jam Tan !

Application web du village de **Diaranguel** (île à Morphil, arrondissement de Saldé,
département de Podor, région de Saint-Louis, Sénégal) : tableau d'affichage officiel,
agenda des cérémonies, annuaire du village et de la diaspora, santé & transport, carte
et guide de route Dakar → Diaranguel consultable hors-ligne.

## Démarrage

```bash
cp .env.example .env          # puis remplir les valeurs (voir ci-dessous)
bun install
bun run db:generate
bun run db:push               # crée/met à jour la base SQLite (db/custom.db)
bun run seed                  # DONNÉES DE DÉMONSTRATION (refuse si la base n'est pas vide ; FORCE_SEED=1 pour forcer)
bun run dev                   # http://localhost:3000
```

Vérifications avant de contribuer : `bun run lint`, `bun run typecheck`, `bun run test`.

## Variables d'environnement (fichier `.env`, jamais commité)

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Base SQLite (`file:./db/custom.db`) |
| `ADMIN_CODE` | Code d'accès admin (8 caractères **minimum**, long et aléatoire). **Obligatoire en production** — le serveur refuse de démarrer sans |
| `ADMIN_SECRET` | Secret HMAC des sessions admin (48 caractères conseillés). **Obligatoire en production** |
| `VILLAGE_CODE` | Code du village pour consulter les contacts personnels (Habitants & Diaspora). À diffuser dans les groupes WhatsApp du village uniquement |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (ex. `https://diaranguel.sn`) — utilisée par les partages WhatsApp et les aperçus sociaux |

Génération de secrets : `openssl rand -hex 24` (secret) et un code admin long et mémorisable.

## Sécurité

- Espace admin `/` → onglet Administration : protégé par `ADMIN_CODE`, session HMAC signée
  (12 h), cookie `httpOnly` + `secure` en production, comparaison à temps constant,
  **5 tentatives maximum par 15 minutes** par IP.
- Contacts personnels (Habitants & Diaspora) : **non publics**. Ils exigent le code du
  village (`VILLAGE_CODE`) ou une session admin. Le service worker ne met jamais en cache
  `/api/admin/*`, `/api/contacts` ni `/api/access`.
- En-têtes HTTP (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy) définis dans `next.config.ts`.
- Données de démonstration : `scripts/seed.ts` crée un contenu **fictif** (noms,
  téléphones, dates). Remplacez-le par les données réelles du village avant mise en
  ligne et n'activez le bandeau d'alerte santé qu'après vérification au poste de santé.

### Après une fuite de secret

1. Définir un nouveau `ADMIN_SECRET` ( invalide toutes les sessions existantes) et un nouveau `ADMIN_CODE`.
2. Si le dépôt est partagé, purger l'historique (`git filter-repo`) puis re-cloner.

## Sauvegarde de la base

```bash
bun run db:backup    # copie horodatée dans backups/ (rotation des 30 dernières)
```

Cron conseillé sur le serveur : `0 2 * * * cd /srv/diaranguel && node scripts/backup-db.mjs >> backups/backup.log 2>&1`

## Structure

- `src/app/` — page unique à sections (`/?tab=accueil|agenda|annuaire|sante|carte|histoire|admin`),
  liens profonds vers une annonce : `/?tab=accueil&a=<id>` ; API REST dans `src/app/api/`.
- `src/components/community/` — vues par section ; administration découpée dans `admin/`.
- `src/lib/` — auth, rate-limit, validation zod, formats (dates « heure du Sénégal »,
  `tel:+221`, `.ics` RFC 5545), client Prisma.
- `public/sw.js` — service worker : pages visitées + tuiles OpenStreetMap (cache LRU 200)
  hors-ligne ; aucune donnée personnelle en cache.
- `scripts/seed.ts` — données de démonstration ; `scripts/backup-db.mjs` — sauvegardes.

## Feuille de route

- Comptes admin **nominatifs** (ou migration Supabase Auth avec RLS) pour révocable par personne.
- Migration éventuelle vers PostgreSQL/Supabase (SQLite convient à un serveur unique avec disque persistant).
- Sauvegarde externe (hors du serveur) en plus de `backups/`.

## Crédits

Photos du fleuve Sénégal fournies par les membres du village (libres d'usage pour ce projet).

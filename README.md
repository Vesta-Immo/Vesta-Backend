# Vesta Backend

Backend NestJS pour les simulations immobilieres Vesta Immo.

## LTS / Versions stables

- Node.js: 22.x (LTS), via [.nvmrc](.nvmrc)
- npm: 10+
- NestJS: 11.x
- TypeScript: 5.x
- Jest: 30.x
- class-validator: 0.14.x
- decimal.js: 10.x

Note: l'environnement de ce workspace tourne en Node 24, ce qui fonctionne, mais en dehors de la plage moteur recommandee du projet.

## Architecture

Le projet suit une approche clean architecture avec separation des couches:

- Domain: regles metier pures et deterministes
- Application: orchestration des cas d'usage
- Infrastructure: controllers HTTP, DTO, integration framework

Structure principale:

```
src/
	core/
	shared-kernel/
	simulation/
		borrowing-capacity/
			domain/
			application/
			infrastructure/
		target-budget/
			domain/
			application/
			infrastructure/
		notary-fees/
			domain/
			application/
			infrastructure/
```

## Endpoints (v1)

Prefix global: `api`

- POST `/api/v1/simulations/borrowing-capacity/compute`
- POST `/api/v1/simulations/target-budget/compute`
- POST `/api/v1/simulations/notary-fees/compute`
- POST `/api/v1/simulations/property-list/settings`
- POST `/api/v1/simulations/property-list/items`
- GET `/api/v1/simulations/property-list/items`
- DELETE `/api/v1/simulations/property-list/items/:propertyId`

Swagger:

- GET `/api/docs`

## Demarrage

```bash
npm install
npm run db:up
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

## Demarrage Docker Compose

Le projet fournit un script [start-docker.sh](start-docker.sh) pour demarrer le backend avec Docker Compose.

Ce script execute:

- `docker compose --env-file .env.docker up --build backend`

Le fichier [.env.docker](.env.docker) centralise les variables utilisees par le service backend dans [docker-compose.yml](docker-compose.yml).

Variables actuellement attendues:

- `DATABASE_URL` (en Compose, utiliser l'hote `postgres` et pas `localhost`)
- `API_KEY` (optionnelle en local si `API_KEY_OPTIONAL=true`)
- `API_KEY_OPTIONAL`
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_JWT_AUDIENCE`
- `NODE_ENV` (optionnel)
- `ENABLE_SWAGGER` (optionnel)
- `CORS_ORIGINS` (optionnel)

Lancement via le script:

```bash
./start-docker.sh
```

Equivalent sans script:

```bash
docker compose --env-file .env.docker up --build backend
```

## Variables d'environnement

- API_KEY: cle requise pour acceder aux endpoints de simulation.
- API_KEY_OPTIONAL: mettre true uniquement en local pour bypasser temporairement la cle.
- DATABASE_URL: URL de connexion Prisma. En local Postgres: `postgresql://vesta:vesta@localhost:5432/vesta_backend?schema=public`.
- PORT: port HTTP (defaut 3000).
- CORS_ORIGINS: liste d'origines autorisees separees par virgule.
- ENABLE_SWAGGER: true pour exposer /api/docs en environnement restreint.

Comportement securite:

- En production, l'application refuse de demarrer si API_KEY est absente.
- Le guard API est fail-closed sauf si API_KEY_OPTIONAL=true.

## Validation

```bash
npm run prisma:generate
npm run build
npm test
```

## Strategie de branche et CI

Le repository suit une approche proche de GitHub Flow avec une branche de reference unique: `main`.

Regles de branchement:

- les developpements se font sur des branches de travail courtes creees depuis `main`
- les changements sont integres via Pull Request vers `main`
- `main` represente l'etat de reference a publier

Le workflow GitHub Actions est defini dans [.github/workflows/docker-build.yml](.github/workflows/docker-build.yml).

Comportement CI/CD actuel:

- sur `pull_request` vers `main`, le pipeline valide que l'image Docker se construit correctement
- sur `push` vers `main`, le pipeline construit, publie l'image dans GCP Artifact Registry, puis deploie automatiquement sur Cloud Run
- sur lancement manuel (`workflow_dispatch`), la publication et le deploiement restent limites a la branche `main`

Strategie de publication et deploiement:

- registre cible: `europe-west1-docker.pkg.dev`
- image backend: `europe-west1-docker.pkg.dev/<GCP_PROJECT_ID>/vesta/nestjs:<tag>`
- tag publie en CI/CD: `${{ github.sha }}`
- service Cloud Run cible: `nestjs-api` (region `europe-west1`)
- deploiement sans trafic public direct (`--no-allow-unauthenticated`)
- scaling: 0 a 5 instances, memoire 256Mi

Secrets GitHub utilises par le backend:

- secret d'organisation: `GCP_SA_KEY` (JSON du service account GCP)
- secret d'organisation: `GCP_PROJECT_ID` (identifiant du projet GCP)
- secret specifique repo backend: `DATABASE_URL`
- secret specifique repo backend: `API_KEY`
- secret specifique repo backend: `SUPABASE_URL`
- secret specifique repo backend: `SUPABASE_JWT_AUDIENCE`
- secret specifique repo backend: `CORS_ORIGINS`

Regles de securite:

- ne jamais utiliser `ghcr.io`
- ne jamais hardcoder de secrets dans le code, les Dockerfiles ou les workflows

Objectif de cette strategie:

- verifier en PR que le backend reste constructible en environnement Docker
- ne publier et deployer une image qu'apres integration sur la branche stable
- garder un flux simple avec un seul fichier de workflow pour la validation, la publication et le deploiement

## Base de donnees

- ORM: Prisma
- Base locale par defaut recommandee: PostgreSQL
- Demarrage local: `npm run db:up`
- Arret local: `npm run db:down`
- Migration de dev: `npm run prisma:migrate:dev`
- Generation du client: `npm run prisma:generate`
- Exploration visuelle: `npm run prisma:studio`
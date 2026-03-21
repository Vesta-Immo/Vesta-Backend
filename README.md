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

## Base de donnees

- ORM: Prisma
- Base locale par defaut recommandee: PostgreSQL
- Demarrage local: `npm run db:up`
- Arret local: `npm run db:down`
- Migration de dev: `npm run prisma:migrate:dev`
- Generation du client: `npm run prisma:generate`
- Exploration visuelle: `npm run prisma:studio`
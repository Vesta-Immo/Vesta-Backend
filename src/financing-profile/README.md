# Financing Profile Module

Module de gestion des profils de financement pour Vesta Immo.

## Architecture

Le module suit l'architecture en couches du projet :

```
financing-profile/
├── domain/                    # Couche domaine (pure, sans dépendances framework)
│   ├── financing-profile.types.ts
│   ├── financing-profile.repository.ts
│   └── errors/
│       └── financing-profile.errors.ts
├── application/               # Couche application (orchestration)
│   ├── use-cases/
│   │   ├── create-profile-from-scenario.use-case.ts
│   │   ├── update-profile-from-scenario.use-case.ts
│   │   ├── set-active-profile.use-case.ts
│   │   ├── delete-profile.use-case.ts
│   │   ├── get-profiles.use-case.ts
│   │   └── get-active-profile.use-case.ts
│   └── services/
│       └── profile-sync.service.ts
├── infrastructure/            # Couche infrastructure (framework, DB)
│   ├── http/
│   │   ├── financing-profile.controller.ts
│   │   └── dto/
│   └── repositories/
│       └── prisma-financing-profile.repository.ts
└── financing-profile.module.ts
```

## Concepts clés

### Profil de financement

Un profil de financement est une copie dénormalisée d'un scénario, utilisée comme configuration financière par défaut pour les simulations.

- **Lien fort** avec le scénario source (référence + synchronisation)
- **Un seul profil actif** par utilisateur
- **Synchronisation automatique** quand le scénario est modifié

### Use Cases

| Use Case | Description |
|----------|-------------|
| `CreateProfileFromScenario` | Crée un profil depuis un scénario, le définit comme actif |
| `UpdateProfileFromScenario` | Synchronise un profil depuis son scénario source |
| `SetActiveProfile` | Change le profil actif de l'utilisateur |
| `DeleteProfile` | Supprime un profil avec gestion du profil actif |
| `GetProfiles` | Liste tous les profils avec le profil actif |
| `GetActiveProfile` | Récupère le profil actif |

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/financing-profiles` | Liste tous les profils |
| GET | `/financing-profiles/active` | Profil actif |
| POST | `/financing-profiles` | Crée un profil depuis un scénario |
| POST | `/financing-profiles/:id/sync` | Synchronise un profil |
| POST | `/financing-profiles/set-active` | Définit le profil actif |
| PATCH | `/financing-profiles/:id` | Met à jour les métadonnées |
| DELETE | `/financing-profiles/:id` | Supprime un profil |

## Intégration avec les scénarios

Pour synchroniser automatiquement un profil quand son scénario est modifié :

```typescript
// Dans le use case de mise à jour de scénario
await this.profileSyncService.handleScenarioUpdated({
  userId,
  projectId,
  scenarioId,
  changeType: 'input',
  timestamp: new Date(),
});
```

## Erreurs métier

| Erreur | Code HTTP | Description |
|--------|-----------|-------------|
| `ProfileNotFoundError` | 404 | Profil inexistant |
| `SourceScenarioNotFoundError` | 404 | Scénario source inexistant |
| `ProfileAlreadyExistsError` | 409 | Profil déjà existant pour ce scénario |
| `LastProfileDeletionError` | 400 | Tentative de suppression du dernier profil |
| `IncompleteProfileError` | 400 | Profil incomplet (scénario non calculé) |
| `NoActiveProfileError` | 404 | Aucun profil actif défini |

## Modèle de données

### FinancingProfile

```typescript
{
  id: string;
  userId: string;
  sourceScenarioId: string;
  sourceProjectId: string;
  settings: FinancingProfileSettings;  // Copie du ScenarioInput
  name: string;
  description?: string;
  isComplete: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserPreferences

```typescript
{
  userId: string;
  activeProfileId: string | null;
}
```

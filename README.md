# I&P AC/AB Operations Hub

Plateforme de pilotage des Advisory Committees & Advisory Boards pour I&P (Investisseurs & Partenaires).

## 🎯 Objectifs

- **Centraliser** l'ensemble de la chronologie opérationnelle d'un événement AC/AB
- **Visualiser** l'avancement, les risques et les blocages en temps réel  
- **Structurer** l'exécution pour l'Investment Manager et l'équipe locale
- **Sécuriser** la supervision du Top Management (risques + budget)
- **Assister** via IA pour la génération d'emails et documents

## 🚀 Stack Technique

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Turso (SQLite edge) via Drizzle ORM
- **AI**: Claude API (Anthropic)
- **Déploiement**: Vercel

---

## 🛠 Installation locale

```bash
# 1. Cloner et installer
git clone <repo-url>
cd ip-acab-hub
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# 3. Initialiser la base de données locale
npm run db:init

# 4. (Optionnel) Charger les données de démo
npm run db:seed

# 5. Lancer le serveur
npm run dev
```

Ouvrir http://localhost:3000

---

## ☁️ Déploiement sur Vercel

### Étape 1 : Créer la base Turso

```bash
# Installer Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Se connecter
turso auth login

# Créer la base de données
turso db create ip-acab-hub

# Récupérer l'URL et le token
turso db show ip-acab-hub --url
turso db tokens create ip-acab-hub
```

### Étape 2 : Initialiser les tables

```bash
# Exécuter la migration avec les credentials Turso
DATABASE_URL="libsql://ip-acab-hub-xxx.turso.io" \
DATABASE_AUTH_TOKEN="xxx" \
npm run db:migrate
```

### Étape 3 : Déployer sur Vercel

1. Push le code sur GitHub
2. Importer le projet dans Vercel
3. Configurer les variables d'environnement :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `libsql://ip-acab-hub-xxx.turso.io` |
| `DATABASE_AUTH_TOKEN` | Token généré par Turso |
| `ANTHROPIC_API_KEY` | Votre clé API Claude |
| `NEXT_PUBLIC_APP_URL` | URL de votre app Vercel |

4. Déployer !

### Étape 4 : (Optionnel) Charger les données de démo

```bash
DATABASE_URL="libsql://..." \
DATABASE_AUTH_TOKEN="..." \
npm run db:seed
```

---

## 📊 Fonctionnalités

### Dashboard événement
- 5 KPIs : tâches, participants, budget, J-X
- Heatmap visuelle des 14 workstreams
- Liste des tâches critiques/bloquantes

### Go/No-Go automatique
- 10 critères évalués en temps réel
- 6 blockers + 4 warnings
- Verrouillage automatique si conditions remplies

### Assistant IA
- Génération d'emails de relance RSVP
- Lettres d'invitation visa
- Demandes de decks aux entreprises
- Analyse des risques

### Gestion complète
- Participants : RSVP, visas, vols, hôtel
- Tâches : par workstream, deadlines, criticité
- Budget : prévu vs engagé vs payé
- Visites : pipeline avec readiness score

---

## 🗂 14 Workstreams

1. Sélection des dates
2. Visas & Immigration
3. Vols & Transferts
4. Hôtel
5. Salles de réunion
6. AV & Traduction
7. Visites d'entreprises
8. Transport terrestre
9. Restauration
10. Événement écosystème
11. IT & Connectivité
12. Sécurité
13. Budget & Contrats
14. Communications

---

## 🔐 Rôles utilisateurs

| Rôle | Permissions |
|------|------------|
| **Investment Manager** | Pilotage complet, validation Go/No-Go |
| **Équipe Locale** | Exécution terrain, mise à jour tâches |
| **Top Management** | Supervision read-only, alertes |

---

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js
│   ├── (dashboard)/        # Layout avec navigation
│   │   ├── page.tsx        # Home - liste événements
│   │   └── events/[id]/    # Détail événement
│   └── api/                # Routes API
├── components/
│   ├── ui/                 # Composants shadcn/ui
│   ├── dashboard/          # Stats, blocking tasks
│   ├── events/             # Go/No-Go, heatmap
│   ├── participants/       # Table, formulaire
│   ├── tasks/              # Liste, formulaire
│   └── ai/                 # Copilot IA
├── db/
│   ├── schema.ts           # Schéma Drizzle
│   ├── migrate.ts          # Migration Turso
│   ├── seed.ts             # Données de démo
│   └── index.ts            # Connexion DB
├── lib/
│   ├── actions/            # Server actions
│   ├── go-no-go.ts         # Logique métier
│   └── utils.ts            # Helpers
└── types/                  # Types TypeScript
```

---

## 🧪 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Lancer en production
npm run lint         # Vérifier le code

npm run db:migrate   # Créer les tables (Turso)
npm run db:init      # Créer les tables (local)
npm run db:seed      # Charger données de démo
npm run db:studio    # Interface Drizzle Studio
```

---

## 🔮 Roadmap

### V1.1
- [ ] Export Excel rooming list
- [ ] Export PDF transfer manifest
- [ ] Notifications email automatiques

### V1.2
- [ ] Authentification Clerk
- [ ] Multi-utilisateurs avec permissions
- [ ] Audit log visible

### V2.0
- [ ] Dashboard multi-événements
- [ ] Templates de workstreams
- [ ] Intégration calendrier

---

## 📄 License

Propriétaire - I&P (Investisseurs & Partenaires)

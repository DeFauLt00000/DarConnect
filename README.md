Create a README.md file in the root of the project with exactly this content:

---

# Dar-Connect 🏠

Plateforme immobilière moderne permettant aux locataires de parcourir des biens, réserver des visites, et aux propriétaires de publier leurs annonces.

---

## Mapping du thème

**Thème choisi :** Immobilier — Dar-Connect

| Élément | Table / Bucket | Description |
|--------|---------------|-------------|
| Table A | `profiles` | Les locataires et vendeurs qui s'inscrivent sur la plateforme |
| Table B | `properties` | Les biens immobiliers disponibles à la location |
| Table C | `visits` | Les demandes de visite reliant un locataire à un bien, avec une date et un statut |
| Fichier | `id-scans` (Storage) | Scan de la carte d'identité nationale, uploadé au moment de la réservation |

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 14 (App Router) |
| Langage | TypeScript |
| Style | Tailwind CSS + Framer Motion |
| Backend / BaaS | Supabase (PostgreSQL + Auth + Storage) |
| Déploiement | Vercel |
| Icônes | Lucide React |
| Composants | Radix UI |

---

## Structure de la base de données

### Table A — `profiles`
Étend les utilisateurs Supabase Auth.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Référence auth.users |
| full_name | text | Nom complet |
| phone | text | Numéro de téléphone |
| role | text | 'tenant' ou 'seller' |
| avatar_url | text | Photo de profil |
| created_at | timestamptz | Date d'inscription |

### Table B — `properties`
Les annonces immobilières publiées par les vendeurs.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| title | text | Titre de l'annonce |
| description | text | Description détaillée |
| location | text | Ville / quartier |
| price_per_month | numeric | Loyer mensuel en DZD |
| bedrooms | integer | Nombre de chambres |
| bathrooms | integer | Nombre de salles de bain |
| surface_area | integer | Surface en m² |
| is_available | boolean | Disponibilité |
| owner_id | uuid | Référence vers profiles |
| created_at | timestamptz | Date de publication |

### Table C — `visits`
Les demandes de visite soumises par les locataires.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| tenant_id | uuid | Référence vers profiles |
| property_id | uuid | Référence vers properties |
| visit_date | date | Date souhaitée pour la visite |
| status | text | 'pending', 'confirmed' ou 'cancelled' |
| id_scan_url | text | URL du fichier uploadé |
| created_at | timestamptz | Date de la demande |

### Table annexe — `property_images`
Images multiples associées à chaque bien.

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| property_id | uuid | Référence vers properties |
| image_url | text | URL de l'image dans le Storage |
| display_order | integer | Ordre d'affichage |

---

## Analyse d'architecture

### 1. Pourquoi Vercel + Supabase est plus logique qu'un serveur classique ? (CAPEX vs OPEX)

Un serveur classique implique un investissement initial lourd : achat de machines physiques, licences logicielles, infrastructure réseau, climatisation, et espace dans un datacenter. Ce sont des dépenses en capital, appelées **CAPEX** (Capital Expenditure). Ces coûts sont engagés avant même d'avoir un seul utilisateur, ce qui représente un risque financier énorme pour un projet qui vient de démarrer.

Avec **Vercel + Supabase**, on bascule vers un modèle **OPEX** (Operational Expenditure) : on paie uniquement ce qu'on consomme, mensuellement, sans aucun investissement initial. Supabase offre une base de données PostgreSQL, un système d'authentification, et du stockage de fichiers gratuitement jusqu'à un certain seuil. Vercel déploie automatiquement l'application à chaque push Git, sans configuration serveur. Pour un projet universitaire ou une startup en phase de lancement, ce modèle est non seulement moins cher, mais aussi beaucoup moins risqué.

### 2. Comment Vercel gère-t-il la scalabilité par rapport à un datacenter physique local ?

Un datacenter physique local a une capacité fixe. Si le trafic dépasse ce que les serveurs peuvent supporter, le site tombe. Pour augmenter la capacité, il faut commander de nouveaux serveurs rack, attendre leur livraison, les installer, les configurer, et gérer la climatisation supplémentaire que ça génère. Ce processus peut prendre des semaines.

Vercel fonctionne sur une architecture **serverless** et **edge**. Chaque page et chaque fonction API est déployée comme une fonction indépendante, répliquée automatiquement dans des dizaines de régions mondiales. Quand le trafic augmente, de nouvelles instances se lancent en millisecondes, sans intervention humaine. Quand le trafic baisse, elles s'éteignent automatiquement. Il n'y a ni serveur à acheter, ni climatisation à gérer, ni équipe sysadmin nécessaire.

### 3. Donnée Structurée vs Donnée Non-structurée dans Dar-Connect

Dans notre application, les deux types de données coexistent.

**Données structurées** : tout ce qui est stocké dans PostgreSQL via Supabase. Les tables `profiles`, `properties`, `visits`, et `property_images` contiennent des données organisées en lignes et colonnes, avec des types définis, des contraintes de clés étrangères, et des règles RLS. Par exemple, une visite a toujours un `tenant_id`, un `property_id`, une `visit_date`, et un `status` — la structure est rigide et prévisible.

**Données non-structurées** : les fichiers uploadés dans Supabase Storage. Le scan de carte d'identité nationale (bucket `id-scans`) et les photos des biens (bucket `property-images`) sont des fichiers binaires — images JPEG, PNG, ou PDF. Ils n'ont pas de schéma, pas de colonnes, pas de relations directes. On stocke uniquement leur URL dans la base de données pour faire le lien. Ces fichiers sont indispensables au fonctionnement métier de l'application : sans la pièce d'identité, la réservation de visite n'est pas complète ; sans les photos, l'annonce n'est pas attractive.

---

## Pages de l'application

| Route | Accès | Description |
|-------|-------|-------------|
| `/` | Public | Page d'accueil avec hero, stats, biens en vedette |
| `/auth/login` | Public | Connexion |
| `/auth/register` | Public | Inscription |
| `/dashboard` | Locataire | Tableau de bord personnel |
| `/properties` | Locataire | Liste de tous les biens disponibles |
| `/properties/[id]` | Locataire | Détail d'un bien avec galerie et sidebar |
| `/visits` | Locataire | Mes demandes de visite |
| `/visits/new` | Locataire | Réserver une visite + upload pièce d'identité |
| `/profile` | Locataire | Modifier mon profil |
| `/sell` | Vendeur | Tableau de bord vendeur + mes annonces |
| `/sell/new` | Vendeur | Publier une nouvelle annonce (formulaire 3 étapes) |
| `/sell/edit/[id]` | Vendeur | Modifier ou supprimer une annonce |

---

## Sécurité (Row Level Security)

Toutes les tables ont RLS activé dans Supabase :

- Un locataire ne voit **que ses propres visites**
- Un vendeur ne peut modifier **que ses propres annonces**
- Les profils sont visibles par tous les utilisateurs authentifiés (pour afficher le nom du vendeur)
- Le Storage est protégé : chaque utilisateur ne peut accéder qu'à son propre dossier

---

## Déploiement

1. Pusher le code sur GitHub
2. Connecter le dépôt à Vercel
3. Ajouter les variables d'environnement dans Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Chaque `git push` déclenche un redéploiement automatique

---

## Membres du groupe

| Nom | Rôle |
|-----|------|
| [Nom 1] | Frontend / UI |
| [Nom 2] | Backend / Supabase |
| [Nom 3] | DevOps / Intégration |

---

*Projet réalisé dans le cadre du module Architecture Cloud & Vibe Programming — ESTIN 2025*

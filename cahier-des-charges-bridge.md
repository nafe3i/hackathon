# Cahier des charges — Bridge

**Plateforme d'assistance à la communication pour personnes autistes et leur entourage**
Hackathon : Build with Gemma — GDG On Campus ENSA Berrechid × AI Crafters × Gemma Team
Équipe : 4 personnes | Modèle obligatoire : Gemma 4
Réalisation : Application Web (React + FastAPI)

---

## 1. Contexte et problématique

Les personnes autistes vivent régulièrement des moments de surcharge sensorielle ou émotionnelle où la parole devient difficile ou temporairement impossible, même si leur capacité de communication est normale en temps calme. Leur entourage (famille, enseignants, employeurs, inconnus) ne sait souvent pas comment réagir dans ces moments, ce qui aggrave la crise au lieu de l'apaiser.

Le problème est double :
- La personne autiste manque d'un moyen d'expression rapide et sans effort au moment critique.
- Son entourage manque d'un moyen de comprendre et d'agir correctement.

## 2. Vision du produit

Bridge est un co-pilote d'expression, jamais un juge du comportement. Il ne cherche pas à normaliser ou corriger la personne autiste : il lui donne les moyens de s'exprimer à sa façon, et donne à son entourage les moyens de comprendre et de s'adapter en retour.

## 3. Principes de gouvernance (non négociables)

Ces règles encadrent **toutes** les fonctionnalités et doivent guider chaque décision technique :

1. La personne autiste reste toujours propriétaire de ses données et décideur final de ce qui est partagé, y compris dans les fonctionnalités d'urgence.
2. L'IA suggère, elle ne décide jamais — toute sortie de Gemma destinée à être enregistrée ou partagée passe par une validation explicite de l'utilisateur.
3. Aucun profil comportemental caché n'est construit automatiquement.
4. Chaque contact (personne ou inconnu via QR) ne voit que ce que l'utilisateur lui a explicitement autorisé.
5. Pas de reconnaissance faciale/vocale des émotions (biais documentés sur ce public).

## 4. Utilisateurs cibles

| Persona | Rôle | Besoin |
|---|---|---|
| Personne autiste | `role: autiste` | S'exprimer rapidement, sans effort, y compris en crise |
| Contact réseau (famille, proche, enseignant) | `role: reseau` | Recevoir des alertes et voir les cartes autorisées via invitation |
| Inconnu / passant | Aucun compte requis | Consulter le profil QR public et comprendre comment réagir |

## 5. Fonctionnalités — priorisation MoSCoW pour le hackathon

### Must have (démo live, doit être impeccable)
- **Création de carte** : texte, pictogramme, message vocal préenregistré
- **Chatbot de création de carte assistée (phase calme)** : l'utilisateur écrit librement, Gemma détecte l'état et propose des suggestions de carte (état + solution), validation obligatoire avant sauvegarde
- **Mode crise** : accès en un tap aux cartes existantes, aucune saisie de texte requise
  > sur web, le "un tap" = bouton flottant permanent visible sur toutes les pages (position fixed). Les cartes doivent être pré-chargées en mémoire (CardsContext) pour un accès instantané sans appel réseau
- **Voix d'urgence automatique** : quand la personne sélectionne une carte en mode crise, l'appareil de la personne autiste lit le message à voix haute via Web Speech API (natif navigateur, gratuit, zéro installation) pour informer les personnes physiquement présentes autour d'elle. Flux en deux temps :
  1. **Immédiat** : un message générique est joué instantanément, incluant les numéros de téléphone des contacts réseau ayant `recevoir_alertes = true` (*"Cette personne a besoin d'aide, veuillez rester calme et lui donner de l'espace. En cas d'urgence, appelez : [Prénom] au [numéro], [Prénom] au [numéro]..."*)
  2. **Personnalisé** : Gemma reformule la carte sélectionnée en message d'urgence clair pour un inconnu → lu automatiquement dès réception de la réponse API
- **Fiche d'urgence partageable** : sélection de cartes à partager avec un tiers choisi

### Should have (bonus si le temps le permet)
- **Système d'invitation réseau** : la personne autiste saisit l'email d'un contact → lien d'invitation UUID généré → le contact crée un compte `role: reseau` via `InvitePage` en saisissant son nom, mot de passe et **numéro de téléphone** → lié automatiquement → permissions activables par la personne autiste (`voir_cartes` / `recevoir_alertes` / `voir_profil_urgence`)
- **Alerter mon entourage** : un tap envoie la carte sélectionnée aux contacts réseau ayant `recevoir_alertes = true`
- **AI Tone Adapter** : adapte le ton de la carte partagée selon le destinataire (formel pour enseignant, chaleureux pour famille), toujours à partir des mots exacts de l'utilisateur
- **AI Family/Educator Guidance** : conseil court ajouté pour le contact réseau qui reçoit une alerte

### Could have (si temps très large ou vision à présenter)
- **Profil QR public + alerte réseau automatique** : page publique accessible sans compte via `GET /public/:public_id` — affiche les états et solutions (cartes `is_public = true`) reformulés par Gemma pour l'inconnu. Dès que le QR est scanné, une notification est envoyée **automatiquement** à tout le réseau de la personne autiste via deux canaux :
  - **Ntfy.sh** (push notification gratuite, app Ntfy sur téléphone du contact)
  - **Email Gmail SMTP** (fallback gratuit pour les contacts sans Ntfy)
  - Message envoyé : *"🚨 [Prénom] a été trouvé(e) en situation de crise — son QR vient d'être scanné par quelqu'un."*
- **Chatbot éducatif général** : réponses au grand public basées sur des ressources publiques curées, indépendant des cartes privées

### Won't have (hors scope hackathon)
- **Contextual Coaching** : présenté comme vision future uniquement, non codé
- Reconnaissance faciale/vocale, profil comportemental automatique, coach IA correcteur de comportement

## 6. Architecture technique proposée

### Stack finale (décisions prises)

| Couche | Technologie | Justification |
|---|---|---|
| Backend | FastAPI (Python) | Rapide à prototyper, async natif, swagger auto-généré |
| Frontend | React + Vite | SPA légère, hot reload rapide, écosystème riche |
| Base de données | SQLite (démo) | Zéro configuration, fichier unique, suffisant pour le hackathon |
| ORM | SQLAlchemy | Standard Python, compatible SQLite et PostgreSQL |
| Authentification | JWT via `python-jose` + `bcrypt` | Stateless, simple à intégrer côté React |
| Appels HTTP frontend | Axios | Intercepteur JWT centralisé dans `axiosClient.js` |
| IA Cloud | Gemma 4 via Google AI Studio | Accès gratuit pour hackathon, function calling natif |
| Text-to-Speech | Web Speech API (natif navigateur) | Gratuit, zéro dépendance, zéro installation |
| Notifications push (QR scan) | Ntfy.sh | Gratuit, zéro clé API, simple requête HTTP POST |
| Email fallback (QR scan) | Gmail SMTP via `smtplib` Python | Gratuit, universel, aucune lib externe |
| Stockage médias | Base64 en DB | Zéro dépendance externe pour la démo |
| Invitations réseau | Lien UUID généré (affiché dans l'app) | Pas de dépendance email/SMTP pour la démo |
| Hébergement démo | Local (machine de démo) | Pas de risque réseau pendant la présentation |

### Répartition des usages de Gemma 4

| Fonctionnalité | Usage Gemma 4 | Mode |
|---|---|---|
| Chatbot création de carte | Function calling → sortie structurée JSON (état, solution, ton) | Cloud API |
| Voix d'urgence | Reformulation de la carte en message clair pour un inconnu → lu par Web Speech API | Cloud API |
| AI Tone Adapter | Reformulation contextuelle par destinataire | Cloud API |
| AI Family/Educator Guidance | Génération de conseil court dérivé du message | Cloud API |
| Profil QR public | Reformulation des cartes `is_public` en conseils clairs pour l'inconnu | Cloud API |
| Alerte QR scan | Dès scan du QR → notification Ntfy + email Gmail envoyés au réseau automatiquement | Backend (pas Gemma) |
| Chatbot éducatif général | RAG sur ressources publiques curées (pas de données utilisateurs) | Cloud API |

**Point d'attention technique** : utiliser le function calling natif de Gemma 4 pour forcer une sortie structurée (JSON) plutôt qu'un texte libre à parser — plus fiable pour le CRUD et plus visible comme usage "profond" de Gemma devant les juges.

### Schéma de données (finalisé)

```
User
  id            UUID  (PK)
  username      string  (unique)
  email         string  (unique)
  password      string  (hashé bcrypt)
  role          string  # "autiste" | "reseau"
  phone         string  (nullable — saisi par le contact réseau à la création de son compte)
  public_id     UUID  (unique — URL du profil QR, autiste seulement)
  created_at    datetime

Card
  id            UUID  (PK)
  user_id       UUID  (FK → User autiste)
  text          string
  pictogram     string  (base64, nullable)
  audio         string  (base64, nullable)
  state         string  # ex: "surcharge sensorielle", "besoin de calme", "douleur"
  tone          string  # ex: "neutre", "formel", "chaleureux"
  is_public     boolean  (default: false — opt-in pour le profil QR)
  is_shared     boolean  (default: false — visible par les contacts réseau autorisés)
  created_at    datetime

Invitation
  id            UUID  (PK)
  owner_id      UUID  (FK → User autiste)
  email         string  (email du contact invité)
  token         UUID  (unique — utilisé dans le lien d'invitation)
  status        string  # "pending" | "accepted"
  created_at    datetime
  expires_at    datetime  # valide 7 jours

NetworkLink  (créé automatiquement quand l'invitation est acceptée)
  id                    UUID  (PK)
  autiste_id            UUID  (FK → User autiste)
  contact_id            UUID  (FK → User reseau)
  voir_cartes           boolean  (default: false)
  recevoir_alertes      boolean  (default: false)
  voir_profil_urgence   boolean  (default: false)
  ntfy_topic            string  (nullable — topic Ntfy du contact pour push notification)
  email                 string  (nullable — email du contact pour fallback Gmail)
  linked_at             datetime

QRScanLog  (enregistre chaque scan du QR public)
  id            UUID  (PK)
  autiste_id    UUID  (FK → User autiste)
  scanned_at    datetime
  notified      boolean  (default: false — passe à true après envoi notifications)
```

### Endpoints backend (FastAPI)

```
# Auth
POST   /auth/register                     # créer un compte (role: autiste)
POST   /auth/login                        # retourne un JWT

# Cards
POST   /cards                             # créer une carte
GET    /cards                             # lister les cartes de l'utilisateur connecté
PATCH  /cards/{id}                        # modifier une carte
DELETE /cards/{id}                        # supprimer une carte

# IA
POST   /ai/formulate                      # chatbot création de carte → suggestions Gemma (JSON structuré)
POST   /ai/voice-message                  # reformuler une carte en message vocal d'urgence pour un inconnu
POST   /ai/tone-adapt                     # reformuler une carte selon le destinataire
POST   /ai/family-guidance               # générer un conseil court pour un contact réseau

# Invitations & réseau
POST   /invitations                       # créer une invitation (génère token + lien)
GET    /invitations/accept/{token}        # accepter une invitation → crée compte reseau + NetworkLink
GET    /network                           # lister les contacts réseau liés (côté autiste)
PATCH  /network/{contact_id}/permissions  # modifier les permissions d'un contact réseau

# Alertes
POST   /alert/{contact_id}               # envoyer une carte à un contact réseau

# Public (sans authentification)
GET    /public/{public_id}               # profil QR public — états + solutions reformulés par Gemma + déclenche alerte réseau automatique (Ntfy + email)
POST   /public-chat                      # chatbot éducatif général
```

## 7. Livrables attendus (jour J)

Conformément aux exigences du hackathon :
1. Démo en direct (app hébergée ou Kaggle Notebook fonctionnel)
2. Rapport technique (Kaggle Writeup) — architecture, usage de Gemma 4, défis rencontrés
3. Dépôt de code public documenté (GitHub)
4. Pitch devant les jurys

## 8. Risques identifiés et mitigation

| Risque | Mitigation |
|---|---|
| Trop de fonctionnalités, rien de fini | Se concentrer sur les "Must have" en premier, ne pas coder les "Could have" avant que le cœur soit stable |
| Démo offline mal comprise si sur-promise | Être transparent dans le pitch : ce qui tourne réellement en local vs l'architecture cible |
| Doute des juges sur la validation terrain | Assumer honnêtement le stade de prototype, insister sur le design éthique |
| Détection d'état imprécise par Gemma | Toujours présentée comme suggestion, jamais sauvegardée sans validation explicite |
| Latence Gemma Cloud API en démo live | Message vocal générique joué immédiatement en fallback — Gemma répond en arrière-plan |
| Gemma retourne du JSON malformé | Toujours entourer les appels Gemma d'un try/catch + fallback |
| CORS entre FastAPI et React | Configurer `CORSMiddleware` dans FastAPI dès le début |
| Cache mode crise | Cartes chargées dans `CardsContext` au login + `localStorage` en backup |
| Lien invitation non reçu | Le lien est affiché dans l'app et partagé manuellement — pas de dépendance SMTP |
| Ntfy non installé chez le contact | Email Gmail SMTP envoyé en fallback automatique — zéro action requise |
| Fausse alerte QR (scan par curiosité) | Acceptable pour la démo — en production, ajouter un délai de confirmation ou un compteur de scans |

## 9. Décisions prises (finalisées)

| Décision | Choix retenu |
|---|---|
| Authentification | Vrai système register/login avec JWT (python-jose + bcrypt) |
| Types de comptes | `role: autiste` (créateur) et `role: reseau` (contact invité) |
| Invitation réseau | Lien UUID affiché dans l'app, partagé manuellement — pas de SMTP pour la démo |
| Permissions réseau | 3 permissions par contact : `voir_cartes`, `recevoir_alertes`, `voir_profil_urgence` |
| Profil QR public | Affichage des cartes `is_public = true` reformulées par Gemma — pas de chatbot interactif |
| Alerte QR scan | Dès scan → Ntfy push (gratuit) + Gmail SMTP (fallback gratuit) envoyés automatiquement au réseau |
| Stockage médias | Base64 en DB, taille max 500KB par média |
| Mode crise UX | Bouton rouge flottant `position: fixed` visible sur toutes les pages autiste |
| Cache mode crise | Cartes dans `CardsContext` au login + `localStorage` en backup |
| Accès Gemma 4 | Google AI Studio — une seule clé API gérée dans le `.env` backend |
| Modèle IA | Gemma 4 Cloud API uniquement (Google AI Studio) — gratuit, pas de modèle local |
| Hébergement démo | Tout en local sur la machine de démo |
| Répartition des rôles | À assigner par l'équipe (Backend / Frontend / IA / Design) |
| Numéros contacts dans voix d'urgence | Option B — le contact réseau saisit lui-même son `phone` via `InvitePage` à la création de son compte |

## 10. Pages de l'application web

### Pages publiques (sans compte)
| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Connexion (autiste ou réseau) |
| `/register` | RegisterPage | Création de compte autiste uniquement |
| `/invite/:token` | InvitePage | Accepter une invitation → créer compte réseau (nom + mot de passe + numéro de téléphone) |
| `/public/:public_id` | PublicProfilePage | Profil QR — états + solutions reformulés par Gemma pour l'inconnu |
| `/public-chat` | PublicChatPage | Chatbot éducatif général |

### Pages compte autiste (`role: autiste`)
| Route | Page | Description |
|---|---|---|
| `/dashboard` | DashboardPage | Vue d'ensemble + accès rapide mode crise |
| `/cards` | CardsPage | Liste, création, édition, suppression des cartes |
| `/chat` | ChatPage | Chatbot Gemma — création assistée de cartes |
| `/network` | NetworkPage | Gérer les contacts réseau, invitations, permissions |
| `/emergency` | EmergencyProfilePage | Choisir les cartes `is_public = true` pour le QR |

### Pages compte réseau (`role: reseau`)
| Route | Page | Description |
|---|---|---|
| `/network-dashboard` | NetworkDashboardPage | Liste des personnes dont il fait partie du réseau |
| `/network/:autiste_id` | NetworkProfilePage | Cartes autorisées + alertes reçues d'une personne |

> Le `CrisisButton` (bouton rouge flottant) est monté dans `App.jsx` — présent uniquement sur les pages du compte autiste, ouvre le `CrisisOverlay` avec les cartes pré-chargées depuis `CardsContext`.

## 11. Planning hackathon (ordre de développement)

### Phase 1 — Socle (à faire en premier, tout le monde bloqué dessus)
1. Schéma DB + modèles SQLAlchemy (`User` avec `role` + `phone`, `Card`, `Invitation`, `NetworkLink`)
2. Endpoints auth (`/auth/register`, `/auth/login`) + JWT
3. CRUD cartes (`/cards`)
4. `axiosClient.js` + `AuthContext` (gère le `role`) + `ProtectedRoute` côté React

### Phase 2 — Must have
5. Interface cartes (CardList, CardForm, CardItem)
6. `CardsContext` + cache `localStorage` + `CrisisButton` + `CrisisOverlay`
7. Voix d'urgence : Web Speech API dans `CrisisOverlay` + endpoint `/ai/voice-message` (reformulation Gemma) — numéros de téléphone des contacts réseau (`recevoir_alertes = true`) inclus dans le message immédiat
8. Intégration Gemma 4 (`gemma_client.py`) + endpoint `/ai/formulate`
9. ChatBot React (ChatPage, SuggestionCard, validation avant sauvegarde)

### Phase 3 — Should have (si Phase 2 stable)
9. Système invitation (`/invitations`, `/invitations/accept/{token}`, `InvitePage`)
10. NetworkPage (permissions par contact : `voir_cartes`, `recevoir_alertes`, `voir_profil_urgence`)
11. NetworkDashboardPage + NetworkProfilePage (côté compte réseau)
12. Alertes (`/alert/{contact_id}`) + AI Tone Adapter + AI Family Guidance

### Phase 4 — Could have (si temps restant)
13. Profil QR public (`/public/:public_id`) — affichage cartes `is_public` reformulées par Gemma
14. Alerte réseau automatique au scan QR — `ntfy_service.py` + `email_service.py` dans `services/` + `QRScanLog`
15. Chatbot éducatif général (`/public-chat`)

---

*Document de travail — version finale avant développement.*

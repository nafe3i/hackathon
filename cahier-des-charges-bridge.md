# Cahier des charges — Bridge

**Plateforme d'assistance à la communication pour personnes autistes et leur entourage**
Hackathon : Build with Gemma — GDG On Campus ENSA Berrechid × AI Crafters × Gemma Team
Équipe : 4 personnes | Modèle obligatoire : Gemma 4

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

| Persona | Besoin |
|---|---|
| Personne autiste | S'exprimer rapidement, sans effort, y compris en crise |
| Contact de confiance (famille, proche) | Comprendre et réagir correctement à une alerte |
| Enseignant / employeur | Recevoir une communication claire et adaptée au contexte professionnel/scolaire |
| Inconnu / passant | Savoir comment réagir face à une personne en crise, avec ou sans profil public scanné |

## 5. Fonctionnalités — priorisation MoSCoW pour le hackathon

### Must have (démo live, doit être impeccable)
- **Création de carte** : texte, pictogramme, message vocal préenregistré
- **Chatbot de création de carte assistée (phase calme)** : l'utilisateur écrit librement, Gemma détecte l'état et propose des suggestions de carte (état + solution), validation obligatoire avant sauvegarde
- **Mode crise** : accès en un tap aux cartes existantes, aucune saisie de texte requise
  > ⚠️ **À PRÉCISER PAR L'ÉQUIPE** : sur web, le "un tap" = bouton flottant permanent visible sur toutes les pages (position fixed). Pas de widget système possible sur navigateur — les cartes doivent être pré-chargées en mémoire (React state/context) pour un accès instantané sans appel réseau
- **Fiche d'urgence partageable** : sélection de cartes à partager avec un tiers choisi

### Should have (bonus si le temps le permet)
- **Alerter mon entourage** : un tap envoie la carte sélectionnée à un contact de confiance prédéfini, permissions par contact
- **AI Tone Adapter** : adapte le ton de la carte partagée selon le destinataire (formel pour enseignant, chaleureux pour famille), toujours à partir des mots exacts de l'utilisateur
- **AI Family/Educator Guidance** : conseil court ajouté pour le contact qui reçoit une carte

### Could have (si temps très large ou vision à présenter)
- **Profil d'urgence public via QR/badge** : cartes publiques opt-in, consultables par un inconnu via Gemma reformulé, sans mise en commun de données entre utilisateurs
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
| IA Local (mode crise) | Gemma E2B via `llama-cpp-python` | Léger (~2B params), tourne sur CPU, privacy-by-design |
| Stockage médias | Base64 en DB | Zéro dépendance externe pour la démo |
| Alertes | Lien partageable généré (UUID) | Pas de dépendance email/SMS, fonctionne offline |
| Hébergement démo | Local (machine de démo) | Pas de risque réseau pendant la présentation |

### Répartition des usages de Gemma 4

| Fonctionnalité | Usage Gemma 4 | Mode |
|---|---|---|
| Chatbot création de carte | Function calling → sortie structurée JSON (état, solution, ton) | Cloud API |
| AI Tone Adapter | Reformulation contextuelle par destinataire | Cloud API |
| AI Family/Educator Guidance | Génération de conseil court dérivé du message | Cloud API |
| Mode crise (démo offline) | Modèle léger (E2B/E4B) tournant en local sur la machine de démo, sans dépendance réseau — argument privacy-by-design | Local sur la machine de démo (serveur FastAPI local), les cartes sont chargées en mémoire côté frontend au login |
| QR public + reformulation pour inconnu | Reformulation des cartes autorisées en conseils clairs | Cloud API |
| Chatbot éducatif général | RAG sur ressources publiques curées (pas de données utilisateurs) | Cloud API |

**Point d'attention technique** : utiliser le function calling natif de Gemma 4 pour forcer une sortie structurée (JSON) plutôt qu'un texte libre à parser — plus fiable pour le CRUD et plus visible comme usage "profond" de Gemma devant les juges.

### Schéma de données (finalisé)

```
User
  id            UUID  (PK)
  username      string  (unique)
  password      string  (hashé bcrypt)
  public_id     UUID  (unique, utilisé pour l'URL du profil QR public)
  created_at    datetime

Card
  id            UUID  (PK)
  user_id       UUID  (FK → User)
  text          string
  pictogram     string  (base64, nullable)
  audio         string  (base64, nullable)
  state         string  # ex: "surcharge sensorielle", "besoin de calme", "douleur"
  tone          string  # ex: "neutre", "formel", "chaleureux"
  is_public     boolean  (default: false — opt-in explicite pour le profil QR)
  created_at    datetime

Contact
  id                  UUID  (PK)
  user_id             UUID  (FK → User)
  name                string
  share_link          UUID  (unique, généré à la création — lien partageable)
  can_see_cards       boolean  (default: false)
  can_receive_alerts  boolean  (default: false)
  created_at          datetime
```

### Endpoints backend indicatifs (FastAPI)

```
# Auth — ⚠️ MANQUANT dans la version initiale, à ajouter
POST   /auth/register            # créer un compte utilisateur
POST   /auth/login               # retourne un JWT

# Cards
POST   /cards                    # créer une carte (après validation utilisateur)
GET    /cards                    # lister les cartes de l'utilisateur
PATCH  /cards/{id}               # modifier une carte
DELETE /cards/{id}               # supprimer une carte

# IA
POST   /ai/formulate             # chatbot création de carte -> suggestions Gemma
POST   /ai/tone-adapt            # adapter une carte à un destinataire
POST   /ai/family-guidance       # générer un conseil pour un contact

# Contacts & alertes
POST   /contacts                 # ajouter un contact de confiance + permissions
POST   /alert/{contact_id}       # envoyer une carte à un contact en crise — ⚠️ canal à définir

# Public
GET    /emergency-profile/{public_id}   # accès public via QR (cartes autorisées uniquement)
POST   /public-chat              # chatbot éducatif général (RAG ressources publiques)
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
| Démo offline mal comprise si sur-promise | Être transparent dans le pitch : ce qui tourne réellement en local vs l'architecture cible mobile |
| Doute des juges sur la validation terrain (pas d'interviews réelles) | Assumer honnêtement le stade de prototype, insister sur le design éthique comme réponse à des principes documentés, pas comme validation utilisateur |
| Détection d'état imprécise par Gemma | Toujours présentée comme suggestion, jamais sauvegardée sans validation explicite |
| Latence Gemma Cloud API en démo live | Préparer des réponses mockées en fallback — ne pas dépendre du réseau pour les parties critiques de la démo |
| Gemma retourne du JSON malformé (function calling) | Toujours entourer les appels Gemma d'un try/catch + fallback sur réponse vide avec message d'erreur utilisateur |
| CORS entre FastAPI et React | Configurer `CORSMiddleware` dans FastAPI dès le début — ne pas découvrir ce problème en démo |
| Synchronisation offline des cartes | Sur web : utiliser `localStorage` ou `sessionStorage` pour cacher les cartes au login — pas d'AsyncStorage (React Native supprimé). Mode crise fonctionne tant que la page est ouverte |
| Répartition des tâches non définie | ⚠️ **À FAIRE MAINTENANT** : assigner explicitement Backend / Mobile / IA / Design à chaque membre avant de commencer |

## 9. Décisions prises (finalisées)

| Décision | Choix retenu |
|---|---|
| Authentification | Vrai système register/login avec JWT (python-jose + bcrypt) |
| Stockage médias | Base64 en DB, taille max 500KB par média |
| Canal d'alerte | Lien partageable UUID — pas de dépendance externe |
| Mode crise UX | Bouton rouge flottant `position: fixed` visible sur toutes les pages |
| Cache mode crise | Cartes chargées dans `CardsContext` au login, stockées aussi en `localStorage` |
| Accès Gemma 4 | Google AI Studio — une seule clé API gérée dans le `.env` backend |
| Modèle local | Gemma E2B (2B params) — tourne sur CPU, RAM requise ~4GB |
| Hébergement démo | Tout en local sur la machine de démo (pas de risque réseau) |
| Répartition des rôles | À assigner par l'équipe (Backend / Frontend / IA / Design) |

## 10. Pages de l'application web

| Route | Page | Accès | Description |
|---|---|---|---|
| `/login` | LoginPage | Public | Connexion utilisateur |
| `/register` | RegisterPage | Public | Création de compte |
| `/dashboard` | DashboardPage | Privé | Vue d'ensemble, accès rapide aux cartes |
| `/cards` | CardsPage | Privé | Liste, création, édition, suppression des cartes |
| `/chat` | ChatPage | Privé | Chatbot Gemma — création assistée de cartes |
| `/contacts` | ContactsPage | Privé | Gestion des contacts de confiance + permissions |
| `/emergency` | EmergencyProfilePage | Privé | Gestion du profil QR public (cartes opt-in) |
| `/public/:public_id` | PublicProfilePage | Public | Profil d'urgence consultable via QR par un inconnu |
| `/public-chat` | PublicChatPage | Public | Chatbot éducatif général (grand public) |

> Le `CrisisButton` (bouton rouge flottant) est monté dans `App.jsx` — il est présent sur toutes les pages privées et ouvre le `CrisisOverlay` avec les cartes pré-chargées depuis le `CardsContext`.

## 11. Planning hackathon (ordre de développement)

### Phase 1 — Socle (à faire en premier, tout le monde bloqué dessus)
1. Schéma DB + modèles SQLAlchemy (`user`, `card`, `contact`)
2. Endpoints auth (`/auth/register`, `/auth/login`) + JWT
3. CRUD cartes (`/cards`)
4. `axiosClient.js` + `AuthContext` + `ProtectedRoute` côté React

### Phase 2 — Must have
5. Interface cartes (CardList, CardForm, CardItem)
6. `CardsContext` + cache `localStorage` + `CrisisButton` + `CrisisOverlay`
7. Intégration Gemma 4 (`gemma_client.py`) + endpoint `/ai/formulate`
8. ChatBot React (ChatPage, SuggestionCard, validation avant sauvegarde)

### Phase 3 — Should have (si Phase 2 stable)
9. Contacts + lien partageable (`/contacts`, `/alert/{contact_id}`)
10. AI Tone Adapter (`/ai/tone-adapt`) + AI Family Guidance (`/ai/family-guidance`)

### Phase 4 — Could have (si temps restant)
11. Profil QR public (`/emergency-profile/{public_id}`, `PublicProfilePage`)
12. Chatbot éducatif général (`/public-chat`, `PublicChatPage`)

---

*Document de travail — version finale avant développement.*

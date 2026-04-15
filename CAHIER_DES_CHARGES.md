# Lolphabet — Cahier des charges

## Contexte

Projet d'overlay OBS pour une émission Twitch League of Legends où le streameur joue
les champions dans l'ordre alphabétique (ou selon d'autres critères de tri), partie
après partie. L'overlay affiche un **carrousel vertical** montrant les champions passés,
actuel, et à venir.

## Objectifs

- Overlay visuel en Browser Source OBS, fluide et peu gourmand.
- Panneau de contrôle séparé (2e écran) pour piloter la progression.
- Progression persistante (reprise après crash).
- Plusieurs modes de tri, chacun avec sa propre progression indépendante.

---

## Fonctionnalités

### Overlay (affichage OBS)

Carrousel vertical à **5 slots** :

| Position | Contenu                  | Taille relative |
|----------|--------------------------|-----------------|
| Haut +2  | Champion joué il y a 2   | 1/3             |
| Haut +1  | Champion joué précédent  | 2/3             |
| Centre   | **Champion actuel**      | 100% (référence) |
| Bas +1   | Prochain champion        | 2/3             |
| Bas +2   | Champion dans 2 parties  | 1/3             |

- **Nom du champion actuel** affiché au-dessus de son icône.
- **Animation de glissement** (slide vertical) à chaque navigation.
- Fond **transparent** (pour OBS).
- Images : **square icon** via Data Dragon (~120×120, format carré).

### Panneau de contrôle

- Bouton **Précédent**
- Bouton **Suivant**
- Bouton **Sauter à…** (recherche par nom)
- Bouton **Reset** (avec confirmation)
- Sélecteur de **mode de tri**
- Indicateur de progression (ex. `42 / 168`)
- (v2) Hotkeys clavier globaux

### Modes de tri

Chaque mode est une **instance indépendante** avec sa propre progression sauvegardée.
Changer de tri ne perd pas la progression des autres modes.

1. **Ordre alphabétique** (défaut)
2. **Ordre de sortie** (release date)
3. **Rôle principal** (Fighter, Mage, Assassin, Tank, Marksman, Support) — tag principal de Data Dragon, puis alpha à l'intérieur.
4. **Poste** (Top, Jungle, Mid, ADC, Support) — nécessite un mapping manuel (Data Dragon ne fournit pas les postes, à gérer dans un fichier local `positions.json`).

Le mode actif est mémorisé. Au lancement, on reprend sur le dernier mode utilisé
à la position où on en était.

### Navigation

- Passer au **suivant** / **précédent**
- **Sauter** directement à un champion précis
- **Reset** au début de la liste courante

---

## Stack technique

**HTML / CSS / JS vanilla**, pas de framework. Raisons :
- Browser Source OBS légère (aucun bundle, pas de runtime React/Vue).
- Animations CSS natives fluides (`transform` + `transition`).
- Démarrage instantané, zéro build.

### Architecture des processus

```
┌────────────────────────┐      ┌────────────────────────┐
│   overlay.html (OBS)   │      │   control.html (2e     │
│   Browser Source       │◄────►│   écran, navigateur)   │
└────────────┬───────────┘      └────────────┬───────────┘
             │                               │
             │   BroadcastChannel (live)     │
             │◄─────────────────────────────►│
             │                               │
             └──────────┬────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  localStorage   │  ← persistance
              └─────────────────┘
```

**Serveur** : mini serveur de fichiers statiques local (`npx serve` ou équivalent
Node 10 lignes) sur `http://localhost:5173`. Aucun backend, juste pour servir les
fichiers sur la même origine (obligatoire pour `BroadcastChannel`).

### Communication overlay ↔ control

- **`BroadcastChannel`** pour la synchro en temps réel (zéro latence, zéro CPU idle).
- **`localStorage`** pour la persistance sur disque (survit au crash / redémarrage).

Pourquoi ce choix : consommation CPU quasi nulle en idle, synchronisation instantanée,
aucune dépendance, pas de WebSocket ni de serveur à maintenir.

### Données des champions

Source : **Data Dragon** (API publique Riot, pas de clé requise).

- Liste complète + métadonnées (tags, nom, key, numéro).
- Icônes carrées : `https://ddragon.leagueoflegends.com/cdn/<version>/img/champion/<name>.png`.
- Fetch au premier lancement, **cache en `localStorage`** avec la version du patch.
- Re-fetch automatique si nouvelle version détectée.

### Structure des fichiers

```
lolphabet/
├── index.html              ← redirection ou menu
├── overlay.html            ← à charger dans OBS Browser Source
├── control.html            ← panneau de contrôle
├── css/
│   ├── overlay.css
│   └── control.css
├── js/
│   ├── data-dragon.js      ← fetch + cache champions
│   ├── sort-strategies.js  ← 4 modes de tri
│   ├── state.js            ← lecture/écriture localStorage
│   ├── bus.js              ← BroadcastChannel wrapper
│   ├── overlay.js          ← rendu carrousel + animations
│   └── control.js          ← UI panneau de contrôle
├── data/
│   └── positions.json      ← mapping champion → poste (manuel)
└── README.md
```

### Format de l'état persisté

```json
{
  "currentSortMode": "alpha",
  "instances": {
    "alpha":    { "index": 42, "updatedAt": "2026-04-14T20:00:00Z" },
    "release":  { "index": 0,  "updatedAt": null },
    "role":     { "index": 15, "updatedAt": "2026-04-10T18:30:00Z" },
    "position": { "index": 3,  "updatedAt": "2026-04-08T19:00:00Z" }
  },
  "dataDragonVersion": "14.7.1"
}
```

---

## Plan de construction

### ✅ v0.1 — MVP livré

1. ✅ Setup projet + fichiers statiques (pas de serveur, ouverture directe `file://`)
2. ✅ Module `data-dragon.js` : fetch + cache champions avec invalidation par patch
3. ✅ Module `state.js` : persistance localStorage multi-instances (une progression par mode de tri)
4. ✅ Module `sort-strategies.js` : tri alphabétique
5. ✅ `overlay.html` + carrousel 5 slots en arc de cercle, animation slide CSS, grisaille des slots non-centraux
6. ✅ `control.html` + boutons Précédent / Suivant / Reset / Sauter à + sélecteur de tri + recherche par nom
7. ✅ Synchro via `BroadcastChannel` + event `storage` + polling léger (triple filet de sécurité)
8. ✅ Intégration OBS via Browser Source + Custom Browser Dock (même instance CEF = localStorage partagé)

### ✅ v0.2 — tris complets

- ✅ Tri par ordre de sortie (approximation via `key` numérique Data Dragon)
- ✅ Tri par rôle principal (Combattant / Tank / Assassin / Mage / Tireur / Support)
- ✅ Tri par poste (Top / Jungle / Mid / ADC / Support) via `js/positions-data.js`
- ✅ Sélecteur de tri dans le panneau de contrôle
- ✅ Persistance indépendante par instance de tri

### 🚧 v0.3 — confort (à venir)

- Hotkeys clavier globaux (AutoHotkey ou Node listener) — **à confirmer**
- Thème / personnalisation visuelle de l'overlay
- Compteur de progression visible plus proéminent (`42 / 168`)
- Possibilité de configurer la taille / position / couleurs via URL params

### 🚧 v1.0 — nice to have

- Sélection du **skin** par champion (Data Dragon fournit tous les skins)
- Export / import de la progression
- Détection auto du champion en jeu via Riot API (optionnel, le gimmick reste manuel)
- Stats / historique ("combien de temps pour faire tout l'alphabet ?")

---

## Décisions figées

| Point                       | Choix                                       |
|-----------------------------|---------------------------------------------|
| Source données              | Data Dragon                                 |
| Format image                | Square icon                                 |
| Stack                       | HTML/CSS/JS vanilla                         |
| Communication temps réel    | BroadcastChannel                            |
| Persistance                 | localStorage                                |
| Serveur                     | Static file server local, port **5173**    |
| Tri par poste               | Basé sur liste communautaire (u.gg / lolalytics) |
| Comportement Reset          | Reset l'instance du tri courant uniquement |
| Animation slide             | `cubic-bezier(0.22, 1, 0.36, 1)` sur 350ms |
| Persistance multi-tri       | Oui, une progression par mode de tri       |
| Navigation                  | Next / Prev / Jump / Reset                  |
| Hotkeys globaux             | v2, à confirmer                             |
| Skins                       | v3                                          |

---

## Questions ouvertes

_Toutes tranchées — voir tableau des décisions figées ci-dessus._

# Lolphabet — Cahier des charges & spécifications techniques

> Ce document décrit l'architecture, les choix techniques et les fonctionnalités
> de Lolphabet **dans son état actuel** (v1.0.0). Pour l'historique des versions,
> voir [CHANGELOG.md](./CHANGELOG.md). Pour le guide utilisateur,
> voir [README.md](./README.md).

---

## Contexte

Projet d'overlay OBS pour une émission Twitch League of Legends où le streameur joue
les champions selon un ordre défini (alphabétique, par ordre de sortie, par rôle ou
par poste), partie après partie. L'overlay affiche un **carrousel vertical en arc
de cercle** montrant les champions passés, le champion actuel, et les prochains.

## Objectifs

- Overlay visuel en Browser Source OBS, **fluide et peu gourmand**.
- Panneau de contrôle **intégré dans OBS** (Custom Browser Dock) pour piloter la progression.
- **Progression persistante** (reprise après crash ou redémarrage).
- **Plusieurs modes de tri**, chacun avec sa propre progression indépendante.
- **Options d'affichage personnalisables** par le streameur, appliquées en temps réel.
- **Zéro installation, zéro dépendance, zéro serveur** côté utilisateur.

---

## Fonctionnalités

### Overlay (affichage OBS)

Carrousel vertical à **5 slots** disposés en **arc de cercle vers la gauche** :

| Position | Contenu                  | Taille relative | Décalage X (arc) |
|----------|--------------------------|-----------------|------------------|
| Haut −2  | Champion joué il y a 2   | 1/3             | −80 px           |
| Haut −1  | Champion joué précédent  | 2/3             | −35 px           |
| Centre  0 | **Champion actuel**     | 100% (référence) | 0                |
| Bas +1   | Prochain champion        | 2/3             | −35 px           |
| Bas +2   | Champion dans 2 parties  | 1/3             | −80 px           |

- **Nom du champion actuel** affiché juste au-dessus de l'icône centrale.
- **Animation de glissement** verticale (`cubic-bezier(0.22, 1, 0.36, 1)` sur 350 ms)
  à chaque navigation.
- **Slots non-centraux en niveaux de gris**, slot central en couleur avec bordure
  dorée et glow.
- **Fond transparent** (pour OBS).
- Images : **square icon** via Data Dragon (~120×120, format carré).

### Panneau de contrôle

#### Navigation
- Bouton **Précédent**
- Bouton **Suivant** (action principale)
- Bouton **Sauter à…** avec recherche par nom (insensible aux accents)
- Bouton **Reset** (avec confirmation, reset uniquement le tri courant)
- Raccourcis clavier dans le panneau : `←` `→` `Espace`

#### Sélecteur de mode de tri
- Dropdown listant les 4 modes (alphabétique, sortie, rôle, poste)

#### Carte "Options d'affichage"
Toggles à bascule + slider, branchés sur le module `Settings`. Voir détail plus bas.

### Modes de tri

Chaque mode est une **instance indépendante** avec sa propre progression sauvegardée.
Changer de tri ne perd pas la progression des autres modes.

1. **Ordre alphabétique** (défaut) — `name.localeCompare('fr')`
2. **Ordre de sortie** — `parseInt(key)` ascendant (l'ID numérique Riot est attribué
   approximativement dans l'ordre de release)
3. **Rôle principal** — groupé par `tags[0]` Data Dragon dans l'ordre
   `Fighter / Tank / Assassin / Mage / Marksman / Support`, alpha à l'intérieur
4. **Poste** — groupé par poste via `js/positions-data.js` dans l'ordre
   `Top / Jungle / Mid / ADC / Support`, alpha à l'intérieur. Champions non-mappés
   tombent dans un bucket "Autre" en fin de liste.

Le mode actif est mémorisé. Au lancement, on reprend sur le dernier mode utilisé
à la position où on en était.

### Options d'affichage (paramétrables)

Toutes activables / réglables depuis la carte "Options d'affichage" du panneau,
appliquées en temps réel sur l'overlay et persistées dans `localStorage`.

| Option (clé Settings)     | Type    | Défaut | Effet visuel |
|---------------------------|---------|--------|--------------|
| `showPositionNumbers`     | boolean | `true` | Badge `#N` (1-based) en bas à droite de chaque icône, doré sur le slot central |
| `blurUpcoming`            | boolean | `false` | Floute uniquement l'**image** des slots `+1` et `+2`, le cadre reste net |
| `blurIntensity`           | number (1..20) | `8` | Intensité du flou en pixels, slider live |
| `showGlobalCounter`       | boolean | `false` | Pavé doré "42 / 168" en haut à droite de l'overlay |
| `markPastPlayed`          | boolean | `false` | ✓ vert posé sur les slots `−1` et `−2` + cadre vert |
| `markUpcoming`            | boolean | `false` | ⏳ posé sur les slots `+1` et `+2` (cadre laissé en gris) |

Les options se cumulent librement.

---

## Stack technique

**HTML / CSS / JavaScript vanilla**, pas de framework, pas de build, pas de serveur.

Raisons :
- Browser Source OBS légère (aucun bundle, pas de runtime React/Vue).
- Animations CSS natives fluides (`transform` + `transition`).
- Démarrage instantané, pas de processus de compilation.
- Distribution simple : zip → dézip → ouvrir dans OBS.

### Architecture des processus

L'app fonctionne **entièrement dans le navigateur Chromium embarqué d'OBS** (CEF) :

```
┌────────────────────────────────────────────────────────┐
│                      OBS Studio                         │
│                                                         │
│  ┌──────────────────┐      ┌────────────────────────┐  │
│  │  Browser Source  │      │  Custom Browser Dock   │  │
│  │  overlay.html    │◄────►│  control.html          │  │
│  │  (carousel)      │      │  (boutons + options)   │  │
│  └──────────────────┘      └────────────────────────┘  │
│           │                            │                │
│           │  BroadcastChannel + storage event + polling │
│           │                            │                │
│           └─────────┬──────────────────┘                │
│                     │                                   │
│                     ▼                                   │
│           ┌─────────────────┐                           │
│           │  localStorage   │  ← persistance            │
│           │  (CEF interne)  │                           │
│           └─────────────────┘                           │
└────────────────────────────────────────────────────────┘
```

**Pas de serveur local.** Les fichiers sont chargés en `file://` directement par OBS.
Comme OBS n'instancie qu'un seul Chromium pour tous ses Browser Sources et Docks,
les deux pages **partagent le même `localStorage`**, ce qui rend la synchro possible
sans backend.

### Communication overlay ↔ control

Triple mécanisme par redondance pour garantir la fiabilité dans tous les contextes
(file://, OBS CEF, restrictions navigateur) :

1. **`BroadcastChannel`** (canal nommé `lolphabet`) — synchro en temps réel quand
   c'est supporté.
2. **Event `storage`** sur `window` — écoute les modifications des clés
   `lolphabet.state.v1` et `lolphabet.settings.v1`.
3. **Polling toutes les 500 ms** des signatures de ces deux clés en local — filet
   final si les deux mécanismes ci-dessus échouent (cas connus avec certaines
   politiques restrictives de CEF).

`State.load()` étant idempotent, les trois mécanismes peuvent cohabiter sans risque
de double-application.

### Données des champions

Source : **Data Dragon** (API publique Riot, pas de clé requise).

- Liste complète + métadonnées (`tags`, `name`, `key`, `title`).
- Icônes carrées : `https://ddragon.leagueoflegends.com/cdn/<version>/img/champion/<name>.png`.
- Fetch au premier lancement, **cache dans `localStorage`** avec la version du patch.
- Re-fetch automatique si nouvelle version de patch détectée.
- **Mode dégradé hors ligne** : si pas de réseau au démarrage et qu'un cache existe,
  on s'en sert.

### Mapping champion → poste

`js/positions-data.js` exporte un objet `Lolphabet.Positions.POSITIONS` qui mappe
chaque ID champion (au format Data Dragon : `Aatrox`, `MonkeyKing`, `Belveth`, etc.)
à un poste parmi `top / jungle / mid / adc / support`.

- Liste maintenue à la main, basée sur le méta communautaire (u.gg / lolalytics).
- Les ~168 champions actuels sont tous mappés.
- Les nouveaux champions non encore listés tombent dans un bucket `other` en fin
  de liste pour le tri par poste — l'app ne casse jamais.
- Contributions par PR encouragées.

### Structure des fichiers

```
lolphabet/
├── overlay.html              ← chargé par OBS Browser Source
├── control.html              ← chargé par OBS Custom Browser Dock
├── css/
│   ├── overlay.css           ← styles du carrousel + options
│   └── control.css           ← styles du panneau (cards, toggles, slider)
├── js/
│   ├── data-dragon.js        ← fetch + cache champions Data Dragon
│   ├── positions-data.js     ← mapping champion → poste
│   ├── sort-strategies.js    ← 4 stratégies de tri
│   ├── state.js              ← persistance progression multi-instances
│   ├── settings.js           ← persistance préférences d'affichage
│   ├── bus.js                ← BroadcastChannel + fallback storage event
│   ├── overlay.js            ← rendu carrousel + animations + options
│   └── control.js            ← UI panneau de contrôle
├── .github/
│   └── ISSUE_TEMPLATE/       ← templates bug / feature / config
├── README.md                 ← guide utilisateur
├── CHANGELOG.md              ← historique des versions
├── CONTRIBUTING.md           ← guide de contribution
├── CAHIER_DES_CHARGES.md     ← (ce fichier)
├── LICENSE                   ← MIT
└── .gitignore
```

### Structure DOM d'un slot

```html
<div class="slot is-past|is-current|is-upcoming">
  <div class="slot-frame">      <!-- bordure et ombres (TOUJOURS net) -->
    <img />                     <!-- seul élément qui reçoit grayscale + blur -->
  </div>
  <div class="slot-status"></div>    <!-- pictogramme ✓ ou ⏳ via ::before -->
  <div class="slot-position">#42</div>
</div>
```

La séparation `.slot-frame` (cadre) / `<img>` (image) permet de **flouter
uniquement l'image** sans dégrader la lisibilité du cadre — point critique pour
la qualité visuelle de l'option `blurUpcoming`.

### Format de l'état persisté

#### Progression — `localStorage["lolphabet.state.v1"]`
```json
{
  "currentSortMode": "alpha",
  "instances": {
    "alpha":    { "index": 42, "updatedAt": "2026-04-15T20:00:00Z" },
    "release":  { "index": 0,  "updatedAt": null },
    "role":     { "index": 15, "updatedAt": "2026-04-10T18:30:00Z" },
    "position": { "index": 3,  "updatedAt": "2026-04-08T19:00:00Z" }
  }
}
```

#### Préférences d'affichage — `localStorage["lolphabet.settings.v1"]`
```json
{
  "showPositionNumbers": true,
  "blurUpcoming": false,
  "blurIntensity": 8,
  "showGlobalCounter": false,
  "markPastPlayed": false,
  "markUpcoming": false
}
```

#### Cache Data Dragon — `localStorage["lolphabet.dataDragon.cache.v1"]`
```json
{
  "version": "14.7.1",
  "champions": [ /* liste normalisée */ ],
  "cachedAt": 1745432109123
}
```

---

## Décisions techniques figées

| Point                       | Choix                                                  |
|-----------------------------|--------------------------------------------------------|
| Source données              | Data Dragon (API publique Riot, sans clé)              |
| Format image                | Square icon                                            |
| Stack                       | HTML/CSS/JS vanilla, pas de framework, pas de build    |
| Communication temps réel    | `BroadcastChannel` + `storage` event + polling 500 ms |
| Persistance                 | `localStorage` (3 clés : state, settings, cache)       |
| Distribution                | Fichiers statiques, ouverture `file://`                |
| Hébergement panneau         | OBS Custom Browser Dock (même CEF que la Browser Source) |
| Tri par poste               | Liste communautaire (u.gg / lolalytics) maintenue dans `js/positions-data.js` |
| Comportement Reset          | Reset l'instance du tri courant uniquement             |
| Animation slide             | `cubic-bezier(0.22, 1, 0.36, 1)` sur 350 ms            |
| Persistance multi-tri       | Oui, une progression par mode de tri                   |
| Navigation                  | Next / Prev / Jump / Reset (boutons + raccourcis)      |
| Couleur "joué"              | `#4ade80` (vert)                                       |
| Couleur "actuel"            | `#f0c13c` (or)                                         |

---

## Roadmap (futurs jalons potentiels)

### v1.x — confort
- **Hotkeys clavier globaux** (AutoHotkey ou Node listener) pour pouvoir avancer
  le carrousel sans alt-tab depuis LoL.
- **Thèmes de couleur** prédéfinis (or / argent / arc-en-ciel / personnalisé).
- **Taille du carrousel** réglable depuis le panneau.
- **Position du compteur global** configurable (haut-gauche / haut-droit / bas).

### v2.0 — fonctionnalités majeures
- **Sélection du skin** par champion (Data Dragon expose tous les skins).
- **Stats de progression** : temps moyen entre 2 champions, durée totale du défi,
  champion préféré (le plus de temps passé), etc.
- **Export / import** de la progression (pour transférer entre PC ou backup).
- **Détection automatique du champion en jeu** via Riot LCU API (optionnel,
  le gimmick reste manuel par défaut).
- **Internationalisation** (anglais en plus du français).

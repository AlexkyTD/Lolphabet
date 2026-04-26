# Lolphabet 🎮

> **Un overlay OBS pour streameurs League of Legends qui jouent tous les champions dans un ordre défini** (alphabétique, par sortie, par rôle, par poste). Fait spécialement pour les défis longue durée façon "tout l'alphabet en stream".

[![Version](https://img.shields.io/github/v/release/AlexkyTD/Lolphabet?label=version)](https://github.com/AlexkyTD/Lolphabet/releases)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-green.svg)](./LICENSE)
[![OBS](https://img.shields.io/badge/OBS-Browser%20Source-302E31?logo=obsstudio)](https://obsproject.com/)

---

## ✨ Aperçu

<!--
  📸 À AJOUTER : un screenshot ou GIF du carrousel en action.
  Mets l'image dans docs/images/ et décommente la ligne ci-dessous.
-->
<!-- ![Aperçu de l'overlay Lolphabet](docs/images/overlay-preview.png) -->

L'overlay affiche un **carrousel vertical en arc de cercle** sur ta scène OBS :

- Les **2 champions précédents** (en haut, en gris)
- Le **champion en cours** (au centre, en couleur, avec son nom)
- Les **2 prochains champions** (en bas, en gris)

À chaque partie, tu cliques **"Suivant"** dans un panneau de contrôle intégré dans OBS, et l'overlay se met à jour avec une animation de glissement fluide.

---

## 🚀 Installation rapide

### Étape 1 — Télécharger

Va sur la page [**Releases**](https://github.com/AlexkyTD/Lolphabet/releases) et télécharge le `Source code (zip)` de la dernière version.

Dézippe le dossier où tu veux (par exemple `C:\OBS\Lolphabet\`).

### Étape 2 — Ajouter l'overlay dans OBS

Dans OBS, sur la scène où tu veux afficher l'overlay :

1. Cliquer sur `+` dans **Sources** → **Browser**
2. Donner un nom (par ex. `Lolphabet overlay`) et valider
3. **URL** : mettre le chemin complet vers `overlay.html`
4. Réglage de taille recommandé : **Largeur : 300** & **Hauteur : 1080** est un bon départ pour un overlay vertical
5. Cocher éventuellement **"Refresh browser when scene becomes active"** (utile en cas de plantage)
6. Valider

L'overlay devrait apparaître avec le carrousel des champions.

<!-- ![Configuration Browser Source dans OBS](docs/images/obs-browser-source.png) -->

### Étape 3 — Ajouter le panneau de contrôle dans OBS

> ⚠️ **Étape critique.** Le panneau de contrôle **doit** être ouvert **à l'intérieur d'OBS** pour pouvoir communiquer avec l'overlay. Si tu l'ouvres dans Chrome / Firefox / Edge à côté, **rien ne se synchronisera** (c'est une limite technique d'OBS, pas un bug).

Dans OBS, menu **View → Docks → Custom Browser Docks…**

1. Clique sur `+`
2. Configure :
   - **Dock Name** : `Lolphabet Contrôle` (ou ce que tu veux)
   - **URL** : chemin complet vers `control.html` au format URL

3. Clique **Apply**, puis **Close**
4. Le dock apparaît en flottant. Tu peux :
   - Le **docker** dans l'interface d'OBS (à côté de tes scènes par exemple)
   - Le **détacher** comme fenêtre flottante sur ton 2e écran

<!-- ![Configuration Custom Browser Dock](docs/images/obs-custom-dock.png) -->

### Étape 4 — Tester

Dans le dock Lolphabet Contrôle, clique **"Suivant ▶"**. Le carrousel doit glisser dans la prévisualisation OBS, et le nom du champion change. **Si ça marche, tu es prêt à streamer.** 🎉

---

## 🎮 Utilisation pendant le stream

### Navigation

| Action | Bouton | Raccourci |
|---|---|---|
| Champion suivant | **Suivant ▶** | `→` ou `Espace` |
| Champion précédent | **◀ Précédent** | `←` |
| Sauter à un champion précis | **Sauter à…** + recherche par nom | — |
| Reset au début du tri courant | **🔄 Reset (tri actuel)** | — |

### Modes de tri

Lolphabet propose **4 manières** d'ordonner les champions, sélectionnables dans la carte **"Mode de tri"** du panneau :

| Mode | Description |
|---|---|
| 🔤 **Ordre alphabétique** | Aatrox → Zyra |
| 📅 **Ordre de sortie** | Du champion le plus ancien au plus récent (basé sur l'ID Riot) |
| ⚔️ **Rôle principal** | Combattant → Tank → Assassin → Mage → Tireur → Support, alpha à l'intérieur |
| 🗺️ **Poste** | Top → Jungle → Mid → ADC → Support, alpha à l'intérieur |

> 💾 **Bonus** : chaque mode garde sa **propre progression**. Tu peux commencer le défi en alphabétique, basculer en mode "par poste" pour varier, puis revenir en alpha — tu reprendras exactement où tu en étais dans chaque mode.

---

## 🎛️ Options d'affichage

Toutes les options se trouvent dans la carte **"Options d'affichage"** du panneau. Elles s'appliquent **en temps réel** sur l'overlay et sont **sauvegardées entre les sessions**.

| Option | Défaut | Description | Quand l'utiliser |
|---|---|---|---|
| **Afficher les numéros** | ✅ activé | Badge `#42` sur chaque icône (doré sur le champion actuel) | Toujours — c'est le repère temporel le plus clair pour les spectateurs |
| **Flouter les prochains champions** | ❌ désactivé | Floute uniquement l'**image** des +1/+2 (le cadre reste net) | Pour créer du suspense, des paris dans le chat |
| **Intensité du flou** | 8 px | Slider 1-20 px qui contrôle la force du flou | Selon que tu veux deviner les silhouettes (faible) ou cacher complètement (fort) |
| **Compteur global** | ❌ désactivé | Petit pavé doré "42 / 168" en haut à droite | Pour montrer la progression globale du défi en un coup d'œil |
| **Marquer les champions joués** | ❌ désactivé | ✓ vert sur les champions passés + cadre vert | Pour valoriser ce qui a déjà été accompli |
| **Marquer les champions à venir** | ❌ désactivé | ⏳ sablier sur les prochains champions | Pour signaler clairement "ce n'est pas encore fait" |

### Combos recommandés

**Setup "minimaliste"** (par défaut) : numéros activés, le reste off → propre, pas chargé.

**Setup "spectateur clair"** : numéros + marquer joués + marquer à venir → triple signal visuel, idéal pour les nouveaux viewers.

**Setup "suspense maximum"** : numéros + flouter les prochains (intensité 14+) → on devine que quelque chose vient mais on ne sait pas quoi.

**Setup "challenge épique"** : compteur global + marquer joués + marquer à venir → met en valeur le défi sur la durée.

---

## ❓ FAQ / Dépannage

### "Je clique Suivant mais l'overlay dans OBS ne bouge pas"

C'est presque toujours parce que le panneau de contrôle est ouvert **dans un navigateur externe** (Chrome / Firefox / Edge) au lieu d'être dans OBS. Le panneau et l'overlay doivent partager le même environnement. Solution :

- Va dans OBS → **View → Docks → Custom Browser Docks**
- Vérifie que `control.html` est bien configuré comme dock
- Ferme le panneau dans Chrome/Firefox

### "Je ne vois rien dans la Browser Source d'OBS"

- Vérifie que le **chemin du fichier** dans la Browser Source pointe bien vers `overlay.html` (pas `control.html`)
- Clique droit sur la Browser Source → **Refresh / Recharger**
- Vérifie que la **largeur / hauteur** ne sont pas trop petites (essaie 300×1080, comme à l'installation)
- Ouvre `overlay.html` dans Chrome ou Edge en double-cliquant pour vérifier que ça marche tout seul

### "Le compteur ou un picto chevauche une icône"

Cela peut arriver si ta Browser Source est très petite verticalement. Augmente la **hauteur** dans OBS (essaie 1080 px) et l'overlay s'aérera.

### "Comment je remets toute la progression à zéro ?"

Dans le panneau, clique le bouton rouge **🔄 Reset (tri actuel)**. Cela ne remet à zéro **que le mode de tri actuel** — les autres modes gardent leur progression. Pour tout remettre à zéro, fais un Reset dans chaque mode.

### "Je ne suis pas d'accord avec le poste assigné à un champion"

Le mapping champion → poste est dans le fichier [`js/positions-data.js`](./js/positions-data.js). Il est basé sur le méta communautaire (u.gg / lolalytics). Tu peux :
- L'éditer toi-même (changer une ligne, recharger l'overlay)
- Proposer une PR sur GitHub pour aider la communauté

### "Comment je change la taille / les couleurs de l'overlay ?"

Pour la **taille du carrousel**, ouvre `css/overlay.css` et modifie la variable `--slot-size` (par défaut `180px`).

Pour les **couleurs principales** (or, vert des champions joués), modifie les variables `--color-gold`, `--color-played` au début du même fichier.

Pour des modifications plus poussées, le code est entièrement commenté en français.

### "Mon nouveau champion fraîchement sorti par Riot n'apparaît pas dans le tri par poste"

L'app détecte automatiquement les nouveaux champions via Data Dragon. Mais si le champion n'est pas listé dans `js/positions-data.js`, il ira dans un bucket "Autre" en fin de liste pour le tri par poste. Une PR pour ajouter son poste serait la bienvenue !

---

## 🤝 Contribuer

Le projet est ouvert à la contribution ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour le détail.

**Cas d'usage typiques :**
- Corriger un poste mal assigné dans `js/positions-data.js`
- Proposer une nouvelle option d'affichage
- Améliorer la traduction ou la doc
- Signaler un bug

**Pour signaler un bug ou proposer une feature**, ouvre une [issue](https://github.com/AlexkyTD/Lolphabet/issues).

---

## 🛠️ Stack technique

- **HTML / CSS / JavaScript vanilla** — aucune dépendance, aucun build, aucun serveur
- [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) (API publique Riot) pour les données et icônes des champions
- `localStorage` pour la persistance + `BroadcastChannel` + `storage` event + polling 500 ms (triple filet de synchro)
- Architecture modulaire en ~10 fichiers JS / CSS, tous commentés

Le cahier des charges complet est dans [`CAHIER_DES_CHARGES.md`](./CAHIER_DES_CHARGES.md).

---

## 📜 Historique des versions

Voir [CHANGELOG.md](./CHANGELOG.md) pour la liste détaillée des changements de chaque version.

---

## 📄 Licence

[MIT](./LICENSE) — utilise, modifie, partage librement. Tu n'as qu'à garder l'attribution.

---

_Lolphabet n'est pas affilié à Riot Games. League of Legends est une marque déposée de Riot Games, Inc._

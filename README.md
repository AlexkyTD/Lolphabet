# Lolphabet

> 🎮 Un overlay OBS pour streameurs League of Legends qui jouent tous les champions dans un ordre défini (alphabétique, ordre de sortie, rôle, poste…).

**Statut : ✅ v0.3 disponible — overlay personnalisable pour les spectateurs.**

## Le concept

Tu veux jouer tous les champions de League of Legends dans un ordre défini sur
ton stream — alphabétique, par ordre de sortie, par rôle, ou par poste ?
Lolphabet t'affiche un carrousel visuel sur ton overlay OBS qui montre :

- Les **2 champions précédents** que tu as joués (en gris)
- Le **champion que tu joues actuellement** (en grand, au centre, en couleur, avec son nom)
- Les **2 prochains champions** à venir (en gris)

Le carrousel est disposé en **arc de cercle vertical**, avec une animation de
glissement douce à chaque changement. À chaque partie, tu cliques "Suivant" depuis
ton panneau de contrôle (directement dans OBS) et l'overlay se met à jour.

## Fonctionnalités

### ✅ Disponibles (v0.3)

- 🎯 **Carrousel vertical en arc** de 5 champions (2 passés, actuel, 2 à venir)
- 🎨 **Slots non-centraux en niveaux de gris**, seul le champion actuel est en couleur avec bordure dorée
- ✨ **Animation de glissement** douce (`cubic-bezier` 350 ms) à chaque navigation
- 🔀 **4 modes de tri** :
  - **Ordre alphabétique** (Aatrox → Zyra)
  - **Ordre de sortie** (du plus ancien au plus récent)
  - **Rôle principal** (Combattant → Tank → Assassin → Mage → Tireur → Support, alpha à l'intérieur)
  - **Poste** (Top → Jungle → Mid → ADC → Support, alpha à l'intérieur)
- 🎛️ **Options d'affichage personnalisables** depuis le panneau de contrôle :
  - **Numéros de position** sur chaque icône (ex. `#42`) pour que les spectateurs voient instantanément où on en est dans le challenge
  - **Flou des prochains champions** pour garder le suspense sur ce qui arrive (sans révéler les 2 prochains)
- 🎮 **Panneau de contrôle** avec Précédent / Suivant / Reset / Sauter à (recherche par nom)
- ⌨️ **Raccourcis clavier** dans le panneau : `←` `→` et `Espace`
- 💾 **Progression sauvegardée** — tu reprends exactement où tu en étais après un crash ou un redémarrage
- 📦 **Progression indépendante par mode de tri** — change de tri et reviens quand tu veux, chaque mode garde sa propre position
- 🖼️ **Icônes officielles** via [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) (API publique Riot, pas de clé nécessaire)
- ⚡ **Zéro installation, zéro dépendance, zéro serveur** : double-clic et ça marche

### 🚧 À venir

- **v0.4** : plus d'options d'affichage (thèmes visuels, taille du carrousel, intensité du flou…), hotkeys clavier globaux
- **v1.0** : sélection du skin par champion, stats de progression, détection auto du champion en jeu

## Installation & utilisation

### 1. Télécharger

Télécharge le `.zip` depuis la page [Releases](https://github.com/AlexkyTD/Lolphabet/releases),
ou clone le repo directement.

Dézippe où tu veux (ex. `C:\OBS\Lolphabet\`).

### 2. Configurer OBS

> ⚠️ **Important** : le panneau de contrôle et l'overlay doivent tourner dans
> **la même instance de navigateur** pour pouvoir se synchroniser. Dans le cadre
> d'OBS, on utilise le navigateur interne d'OBS (CEF) pour les deux. Il ne faut
> **pas** ouvrir le panneau de contrôle dans Chrome/Firefox/Edge à côté — ça ne
> communiquera pas avec OBS.

**A. Ajouter l'overlay (Browser Source)**

1. Dans OBS, sur ta scène, clique sur `+` dans "Sources" → **Browser**
2. Donne-lui un nom, par exemple `Lolphabet overlay`
3. Coche **"Local file"** et pointe vers `overlay.html` du dossier dézippé
4. Largeur / hauteur : ce que tu veux (800×1080 est un bon départ pour un overlay vertical)
5. Valide

**B. Ajouter le panneau de contrôle (Custom Browser Dock)**

1. Dans OBS, menu **View → Docks → Custom Browser Docks…**
2. Clique sur `+` et configure :
   - **Dock Name** : `Lolphabet Contrôle`
   - **URL** : `file:///C:/chemin/complet/vers/control.html`
     (attention aux slashes `/`, pas aux antislashes `\`)
3. Clique **Apply** et ferme
4. Le dock apparaît flottant — tu peux le poser dans l'interface d'OBS,
   ou le détacher comme fenêtre flottante sur ton 2e écran

### 3. Utiliser

Dans le dock Lolphabet Contrôle, clique **"Suivant ▶"** à chaque nouveau champion.
L'overlay bouge en direct dans ta prévisualisation OBS. Tu peux aussi :

- **Précédent** : reculer d'un cran (si tu as cliqué trop vite)
- **Reset** : revenir au premier champion du tri courant
- **Sauter à** : recherche rapide par nom
- **Changer de mode de tri** : chaque mode garde sa propre progression

Raccourcis clavier dans le dock :
- `→` ou `Espace` : suivant
- `←` : précédent

## Stack technique

- **HTML / CSS / JavaScript vanilla** — aucune dépendance, aucun build, aucun serveur
- [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) pour les données des champions (cache localStorage avec invalidation par patch)
- `BroadcastChannel` + `storage` event + polling léger pour la synchro overlay ↔ contrôle

Le cahier des charges complet est dans [`CAHIER_DES_CHARGES.md`](./CAHIER_DES_CHARGES.md).

## Limitations connues

- **Navigateurs séparés** : si tu ouvres l'overlay dans OBS et le contrôle dans
  Chrome/Firefox/Edge à côté, ils **ne pourront pas communiquer**. Chaque
  application a son propre stockage isolé. Utilise le **Custom Browser Dock d'OBS**
  pour le panneau de contrôle (voir ci-dessus).
- **Firefox en file://** : Firefox isole chaque fichier `file://` dans sa propre
  origine, donc même entre deux onglets Firefox, la synchro ne passe pas. Utilise
  Edge ou Chrome si tu veux tester hors d'OBS.
- **Tri par rôle / poste / sortie** : pas encore implémentés (v0.2).

## Contribuer

Le projet est en début de vie — si tu as des idées, bugs, suggestions, ouvre une
[issue](https://github.com/AlexkyTD/Lolphabet/issues) ou une pull request.

### Corriger un poste mal assigné

Le fichier [`js/positions-data.js`](./js/positions-data.js) contient le mapping
champion → poste principal utilisé pour le tri "par poste". C'est une liste
maintenue à la main, basée sur le méta communautaire (u.gg / lolalytics). Si tu
n'es pas d'accord avec une assignation, ou si un nouveau champion manque, il
suffit d'éditer ce fichier et d'ouvrir une PR. Aucun code à modifier.

## Licence

[MIT](./LICENSE) — fais-en ce que tu veux.

---

_Lolphabet n'est pas affilié à Riot Games. League of Legends est une marque déposée de Riot Games, Inc._

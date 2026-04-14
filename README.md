# Lolphabet

> 🎮 Un overlay OBS pour streameurs League of Legends qui jouent tous les champions dans un ordre défini (alphabétique, ordre de sortie, rôle, poste…).

**Statut : 🚧 en cours de développement — MVP pas encore disponible.**

## Le concept

Tu veux jouer tous les champions de League of Legends dans l'ordre alphabétique
sur ton stream ? Ou dans l'ordre de sortie ? Par rôle ? Lolphabet t'affiche un
carrousel visuel sur ton overlay OBS qui montre :

- Les **2 champions précédents** que tu as joués
- Le **champion que tu joues actuellement** (en grand, au centre)
- Les **2 prochains champions** à venir

À chaque partie, tu cliques sur "Suivant" depuis ton panneau de contrôle et
l'overlay se met à jour avec une animation fluide.

## Fonctionnalités prévues

- 🎯 **Carrousel vertical** de 5 champions (2 passés, actuel, 2 à venir)
- 🔄 **4 modes de tri** : alphabétique, ordre de sortie, rôle principal, poste (top/jungle/mid/adc/support)
- 💾 **Progression sauvegardée par mode de tri** — change de tri et reviens quand tu veux
- 🎮 **Panneau de contrôle** séparé : Précédent / Suivant / Sauter à / Reset
- ✨ **Animation de glissement** douce à chaque transition
- 🖼️ **Icônes officielles** des champions via Data Dragon (l'API publique de Riot)
- ⚡ **Zéro installation** : double-clic et ça marche
- 🎨 **Intégration OBS native** via Browser Source

## Installation (à venir)

Une fois la v0.1.0 publiée :

1. Télécharge le `.zip` depuis la page [Releases](https://github.com/AlexkyTD/Lolphabet/releases)
2. Dézippe où tu veux
3. Double-clique sur `control.html` pour ouvrir le panneau de contrôle
4. Dans OBS : **+ → Browser Source → Local file** → pointe vers `overlay.html`
5. Règle la taille et la position, et c'est parti !

## Stack technique

- HTML / CSS / JavaScript vanilla — **aucune dépendance, aucun build**
- [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) pour les données des champions
- `BroadcastChannel` + `localStorage` pour la synchro overlay ↔ contrôle

## Roadmap

- **v0.1** (MVP) : Overlay fonctionnel, tri alphabétique, boutons de navigation
- **v0.2** : Les 3 autres modes de tri (sortie, rôle, poste)
- **v0.3** : Hotkeys clavier globaux, thèmes personnalisables
- **v1.0** : Sélection du skin par champion, stats de progression

Le cahier des charges complet est dans [`CAHIER_DES_CHARGES.md`](./CAHIER_DES_CHARGES.md).

## Contribuer

Le projet est au tout début — si tu as des idées ou des retours, ouvre une
[issue](https://github.com/AlexkyTD/Lolphabet/issues) !

## Licence

[MIT](./LICENSE) — fais-en ce que tu veux.

---

_Lolphabet n'est pas affilié à Riot Games. League of Legends est une marque déposée de Riot Games, Inc._

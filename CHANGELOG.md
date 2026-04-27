# Changelog

Toutes les versions notables de Lolphabet sont documentées ici.

Le projet suit (à peu près) le [versioning sémantique](https://semver.org/lang/fr/).

---

## [1.1.1] — 2026-04-27

### 🎨 Polissage visuel — qualité Riot Games

Refonte de la qualité visuelle suite à un audit critique. Les effets v1.1.0 manquaient de finition. Cette version remet le thème Hextech au niveau "professionnel UI Riot".

### Corrigé
- **Bordure hexagonale qui ne suivait pas la forme** : la bordure CSS s'applique sur un rectangle qui se faisait clipper par `clip-path`, créant des coupures visuelles disgracieuses. Refonte du HTML des slots avec un pattern **double-cadre** :
  - Wrapper extérieur `.slot-frame` au fond coloré (= la bordure visible)
  - Wrapper intérieur `.slot-frame-inner` inseté de 3px, contenant l'image
  - Les deux partagent le même `clip-path` / `border-radius` → la bordure suit parfaitement la forme, hexagonale ou arrondie
- **Police Cinzel illisible** : retour au stack système (`-apple-system, Segoe UI, Roboto`), suppression du `<link>` Google Fonts dans `overlay.html`. Le nom du champion en thème Hextech reste teinté or via `color` + triple `text-shadow`.
- **Conic gradient tournant remplacé** par un halo radial multi-couches qui respire (3 layers : cœur lumineux + halo principal + brume ambient), animé en `scale` + `opacity`. Effet plus organique, façon hexgem qui pulse plutôt que projecteur tournant. `mix-blend-mode: screen` pour un rendu lumière émissive.
- **Glow simple drop-shadow remplacé** par une **pile de 5 drop-shadow** (1px crisp + 6px close + 18px mid + 40px haze + ombre portée). C'est ainsi que les UI pro construisent leurs glows volumétriques. Animation 4s `ease-in-out` (organique) au lieu de 2.6s.
- **Vignettage bleu nuit retiré** : le fond de l'overlay est de nouveau totalement transparent. Plus de `body::before` qui colorait le stream.

### Sous le capot
- Nouvelle propriété CSS `--frame-border` (3px) avec calcul automatique du `--radius-inner` pour cohérence en mode arrondi.
- Le slot central reçoit un dégradé vertical (or clair → or → or sombre) sur le wrapper extérieur, simulant un éclairage naturel d'en haut sur un métal poli.
- Légère asymétrie d'inset en mode hexagonal pour que la bordure reste visible au sommet et à la pointe basse de l'hex.

---

## [1.1.0] — 2026-04-27

### 🎨 Refonte visuelle : système de thèmes + forme hexagonale

Première grosse mise à jour visuelle depuis la v1.0. L'overlay passe d'un look "fonctionnel" à un look "spectaculaire" inspiré de l'univers League of Legends / Arcane.

### Ajouté
- **Système de thèmes** scalable : un fichier CSS par thème dans `css/themes/`. Active via la classe `theme-X` posée sur `<body>`. Conçu pour permettre l'ajout facile de nouveaux thèmes (Zaun, Summoner's Rift…) en PR.
- **Thème Hextech / Piltover** (premier thème non-default) :
  - Aura conique dorée animée (rotation 9 s) derrière le slot central, avec fade radial pour se fondre dans le décor
  - Glow doré pulsant (cycle 2.6 s) via `filter: drop-shadow` (suit la forme exacte du cadre, y compris en hexagonal)
  - Vignettage radial bleu nuit en arrière-plan
  - Double bordure dorée façon ouvrage Piltover sur le slot central
  - Nom du champion en typo **Cinzel** (Google Fonts) avec effet métal embouti via `background-clip: text`
  - Compteur global stylisé en cohérence (typo Cinzel, bordure dorée)
- **Forme hexagonale** des cadres (option indépendante du thème). Implémentée via `clip-path: polygon(...)`. Compatible avec les icônes Data Dragon (symétrique).
- **Carte "Apparence"** dans le panneau de contrôle, avec deux dropdowns indépendants (thème + forme).
- **`Settings.ENUM_VALUES`** : nouveau mécanisme de validation pour les settings énumérés (chaînes), avec fallback automatique sur la valeur par défaut si la valeur stockée est invalide.

### Modifié
- `overlay.html` charge désormais Cinzel via Google Fonts (`<link>` avec preconnect) et le CSS du thème Hextech. Aucun impact pour le thème classique (lazy par activation de classe).
- Nouveau div `.slot-aura` ajouté dans la structure DOM des slots (hidden par défaut, utilisé uniquement par les thèmes qui le souhaitent).
- En forme hexagonale, le badge `#N` et la pastille de statut sont automatiquement recentrés horizontalement pour rester sur la zone visible (les coins du carré sont clippés par l'hexagone).

### Aucune cassure
Toutes les options et progressions existantes sont conservées. Les nouveaux settings (`theme: 'default'` et `slotShape: 'rounded'`) ont des valeurs par défaut qui reproduisent à l'identique le rendu antérieur. Aucune action requise pour les utilisateurs existants.

---

## [1.0.0] — 2026-04-15

### 🎉 Première release stable, prête pour la production

Cette version marque le passage de Lolphabet d'un projet expérimental à un outil **stable et utilisable par tous les streameurs**.

### Ajouté
- README entièrement réécrit comme un guide utilisateur (installation pas-à-pas, FAQ, dépannage, catalogue d'options avec cas d'usage).
- `CHANGELOG.md` formalisant l'historique des versions.
- `CONTRIBUTING.md` détaillant comment contribuer (corriger un poste, proposer une option, signaler un bug).
- Templates d'issue GitHub (bug report + feature request) pour faciliter les retours utilisateurs.

### Aucune cassure
Toutes les fonctionnalités des versions antérieures sont conservées sans changement de comportement.

---

## [0.5.1] — 2026-04-15

### Ajouté
- **Slider d'intensité du flou** (1 à 20 px) dans la carte "Options d'affichage", placé sous le toggle "Flouter les prochains champions". Aperçu en temps réel pendant le drag.

### Sous le capot
- Variable CSS `--blur-intensity` pilotée depuis le panneau via `document.body.style.setProperty`.

---

## [0.5.0] — 2026-04-15

### Ajouté
- **Marquage des champions joués** : pastille verte ✓ + cadre vert sur les champions déjà joués (option `markPastPlayed`).
- **Marquage des champions à venir** : pastille avec sablier ⏳ sur les prochains champions (option `markUpcoming`, cadre laissé en gris).

### Modifié
- **Restructuration HTML des slots** : la bordure est maintenant sur un wrapper `.slot-frame`, séparé de l'image. Conséquence : quand on active le flou, **seule l'image est floutée, le cadre reste net** (lisibilité préservée).
- **Compteur global** déplacé du centre haut vers le **coin haut-droit** (`right: 16px`) pour ne plus chevaucher l'icône `prev2` sur les overlays de hauteur moyenne.
- **Pictos ✓ et ⏳ agrandis** (60×60 px de pastille, 2.4-2.5rem de font-size).
- **Pastilles autour des pictos retirées** : le ✓ et le ⏳ sont posés directement sur l'image, avec une triple ombre portée pour rester lisibles.

### Retiré
- Flèches directionnelles ▲ ▼ (jugées peu utiles à l'usage).

---

## [0.4.0] — 2026-04-15

### Ajouté
- **Compteur global "42 / 168"** : pavé doré au-dessus du nom du champion, option `showGlobalCounter`.
- **Flèches directionnelles ▲ ▼** : option `showDirectionalArrows` (retirée en v0.5.0).

---

## [0.3.0] — 2026-04-15

### Ajouté
- **Module `js/settings.js`** : préférences d'affichage persistées séparément de la progression.
- **Carte "Options d'affichage"** dans le panneau de contrôle, avec design de toggles à bascule.
- **Option "Numéros de position"** : badge `#N` sur chaque icône (doré sur le central). Activée par défaut.
- **Option "Flou des prochains champions"** : floute les slots `+1` et `+2`.

### Modifié
- Les slots portent maintenant des classes sémantiques `.is-past`, `.is-current`, `.is-upcoming` pour permettre des effets visuels ciblés.

---

## [0.2.0] — 2026-04-14

### Ajouté
- **Tri par ordre de sortie** (basé sur l'ID numérique Data Dragon).
- **Tri par rôle principal** (Combattant / Tank / Assassin / Mage / Tireur / Support).
- **Tri par poste** (Top / Jungle / Mid / ADC / Support) via `js/positions-data.js`.
- Mapping complet champion → poste pour ~168 champions.

---

## [0.1.0] — 2026-04-14

### 🎯 Premier MVP utilisable

### Ajouté
- Module `data-dragon.js` : récupération des champions via l'API Data Dragon avec cache localStorage.
- Module `state.js` : persistance localStorage multi-instances (une progression indépendante par mode de tri).
- Module `sort-strategies.js` : tri alphabétique.
- Module `bus.js` : wrapper `BroadcastChannel` + fallback via `storage` event.
- `overlay.html` + `css/overlay.css` + `js/overlay.js` : carrousel vertical en arc de cercle, 5 slots avec animation de glissement, slot central en couleur, autres en niveaux de gris.
- `control.html` + `css/control.css` + `js/control.js` : panneau de contrôle avec boutons Précédent / Suivant / Reset, sélecteur de tri, recherche pour sauter à un champion.
- Synchro overlay ↔ contrôle via triple mécanisme (BroadcastChannel + storage event + polling 500 ms) pour garantir que ça marche dans tous les contextes (file://, OBS CEF, etc.).
- README, LICENSE (MIT), .gitignore, CAHIER_DES_CHARGES.

[1.1.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v1.1.0
[1.0.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v1.0.0
[0.5.1]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.5.1
[0.5.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.5.0
[0.4.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.4.0
[0.3.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.3.0
[0.2.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.2.0
[0.1.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.1.0

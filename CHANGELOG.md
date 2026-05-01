# Changelog

Toutes les versions notables de Lolphabet sont documentées ici.

Le projet suit (à peu près) le [versioning sémantique](https://semver.org/lang/fr/).

---

## [Unreleased]

> Notes pour la prochaine release (probablement **v1.4.0**) : grosse refonte
> visuelle du thème Hextech (cœur cyan, nœuds hexagonaux, sparkle synchronisé)
> et peaufinage Zaun (smog, bulles dispersées, pipe retirée).

### ✨ Thème Hextech — refonte continue (suite des étapes #2, #3, #4)
- **Câble Hextech à 3 brins** : le filament unique est remplacé par
  **3 bandes parallèles** (gauche, centrale, droite) décalées de ±6 px
  en X. La bande centrale est légèrement plus marquée (stroke 1.1)
  que les latérales (0.9) pour une hiérarchie visuelle subtile.
  Effet "circuit Hextech à voies multiples" — câblage signature
  Piltover.
- **Particules distribuées sur les 3 bandes** :
  - `p-gold-1` → bande centrale
  - `p-gold-2` → bande gauche
  - `p-cyan-1` → bande centrale
  - `p-cyan-2` → bande droite
  → Au moins 3 bandes utilisées en simultané, jamais toutes les
  particules sur la même.
- **Sparkles checkpoint réduits à 2 par nœud** : seules les particules
  sur la bande centrale (qui passent réellement sur les nœuds)
  déclenchent les sparkles. 2 par nœud × 4 nœuds = 8 sparkles total
  (au lieu de 16). Plus cohérent visuellement (les particules
  latérales passent à côté des nœuds, donc ne les activent pas).
- **Filigrane décoratif aux 4 coins du slot central** : 4 petits "L"
  en or fin (style "repères de précision Piltover" type cadrage
  d'instrument) positionnés à ±105 px du centre, à l'extérieur du
  slot. Stroke 1.2 px, opacité 0.55, glow doux.
- **Anneau hexagonal rotatif** autour du slot central : hexagone
  vertical (cohérent avec `shape-hexagonal`) en outline doré fin
  (stroke 0.7, opacité 0.30), rayon 110 px, qui tourne en **60 s**
  par tour — très subtil, juste perceptible. Effet "horloge
  mécanique Hextech" qui ajoute du mouvement perpétuel autour du
  champion central sans distraire.

### Modifié
- **Vitesse des particules réduite (~×1.4 plus lent)** sur les deux thèmes
  pour un mouvement plus contemplatif. Les durées restent **coprimes 2-à-2**
  pour préserver le mouvement chaotique sans synchronisation perçue :
  - **Hextech** : `p-gold-1` 9s→13s, `p-gold-2` 11s→17s, `p-cyan-1` 10s→15s,
    `p-cyan-2` 14s→19s.
  - **Zaun** : Bulle 1 11s→17s, Bulle 2 7s→11s, Bulle 3 6s→9s, Bulle 4 9s→13s,
    Bulle 5 (Shimmer) 17s→23s.
  - Les `begin` offsets des 16 sparkles Hextech ont été **recalculés** en
    conséquence (`particle_begin + duration × fraction_du_path`).

### Corrigé
- **Sparkles des nœuds Hextech qui s'arrêtaient après quelques cycles.**
  Cause : l'événement SMIL `id.repeat` est mal supporté en continu dans
  Chrome / OBS CEF — il fire correctement quelques fois puis stoppe.
  Solution : chaque sparkle a maintenant **sa propre période** (`dur` =
  durée de la particule qui le déclenche) avec `repeatCount="indefinite"`,
  et un `begin` offset qui aligne le peak sur le moment où la particule
  passe au nœud. Plus aucune dépendance sur `id.repeat` → fiable
  indéfiniment.

### ☣ Thème Zaun — peaufinage
- **Trait de liaison entre icônes retiré** sur Zaun : la "pipe" industrielle dashée alourdissait l'identité visuelle, les bulles + le smog suffisent à porter le thème.
- **Smog renforcé** : 2 nappes ajoutées sur le côté droit (jusque-là vide à cause du biais d'arc des icônes vers la gauche), opacités peak augmentées (~+0.10). Total 5 nappes avec durées en nombres premiers entre eux (19/22/26/29/35 s) → aucune synchronisation jamais.
- **Bulles dispersées latéralement** : chaque bulle est enveloppée dans un `<g transform="translate(X, 0)">` avec X différent (0, +28, −14, +42, +12) → fini le "convoi" sur une seule ligne.
- **Pop-in des nappes corrigé** : `opacity="0"` ajouté comme attribut par défaut sur tous les `<circle>` avec `begin > 0`, pour qu'ils ne soient pas rendus à pleine opacité sur leur position initiale entre `t=0` et `t=begin`.

### ✨ Thème Hextech — identité Piltover renforcée
- **Cœur magique cyan-bleu** ajouté (le gros oubli initial) : le thème était trop monochrome doré, alors que l'identité Hextech d'Arcane est un duo or (cadre métallique) + cyan (magie cristalline des hexgems).
  - Aura interne : couche cœur passée de blanc-or à blanc-cyan (`#c8e6ff` → `#9ecbff`).
  - **Lueur cyan visible à l'intérieur du cadre** : pseudo-élément `::after` sur `.slot-frame-inner` avec radial-gradient (transparent au centre, cyan aux bords) + `mix-blend-mode: screen`. Fonctionne sur **toutes les formes** (rounded / hexagonal / circle) car héritage du clip-path / border-radius du parent.
  - 2 particules cyan ajoutées au Hexstream (`#c8e6ff` et `#9ecbff`) en plus des dorées.
- **4 nœuds hexagonaux** placés EXACTEMENT sur le path (positions calculées par arc length) : `(-61,-300)`, `(-19,-120)`, `(-19,+120)`, `(-61,+300)`. Style "station de circuit" : hexagone d'or fin + gemme cyan-blanc au centre. Orientation cohérente avec `shape-hexagonal`.
- **Sparkle synchronisé en temps réel** : chaque nœud reçoit 4 `<animateTransform type="scale">` avec `additive="sum"`, déclenchés via les événements SMIL `id.begin + Δs` et `id.repeat + Δs` où Δ = `duration_particule × fraction_du_path`. Quand une particule **touche réellement** un nœud, il scintille (scale 1 → 1.55 → 1 sur 0.5 s, keyTimes "0; 0.3; 1" pour effet "checkpoint hit").
- **1 particule dorée retirée** du Hexstream (la plus petite, r=1.4) : 4 particules au total (2 dorées + 2 cyan) au lieu de 5, aération visuelle.

### 🧹 Nettoyage du code
- `--frame-border-current: 4px` (variable CSS jamais utilisée) supprimée.
- `State.STORAGE_KEY` exposé (cohérence avec `Settings.STORAGE_KEY`) ; les références en dur dans `overlay.js` remplacées par la constante.
- Headers JSDoc mis à jour : `bus.js` documente maintenant l'événement `settings-changed`, `control.js` reflète la portée actuelle (settings + apparence), `state.js` documente `STORAGE_KEY`.
- Dossier `data/` vide (héritage du cahier des charges initial avant que `positions.json` devienne `js/positions-data.js`) supprimé.

---

## [1.3.0] — 2026-04-27

### ☣ Refonte en profondeur du thème Zaun

La v1.2 livrait un Zaun "Hextech-en-vert", trop paresseux. Cette version refait le thème pour qu'il dégage une vraie ambiance Zaun — chaotique, chimique, vivante.

### Modifié — Smogstream entièrement refait
- **Couche 1 ajoutée — Nappes de smog environnemental** : 3 grosses radial gradients très diffuses qui montent du bas vers le haut en grossissant et en dérivant horizontalement (la fumée disperse en s'élevant). Une nappe est en magenta Shimmer pour imprégner discrètement le décor. Filtrées par un `feGaussianBlur stdDeviation="6"` pour un effet de brume, pas des balles colorées.
- **Couche 2 — Pipe industrielle plus erratique** : `stroke-dasharray="2 4 5 3"` (au lieu de `3 5`) pour un effet "tuyau qui fuit" plutôt qu'un pointillé propre.
- **Couche 3 — Bulles avec relief 3D** :
  - Chaque bulle utilise un `radialGradient` avec `cx="35%" cy="30%"` simulant un point lumineux en haut-gauche → effet "savon de chimie", relief 3D pur CSS, pas de couches superposées.
  - 5 bulles au total (4 vertes de tailles 1.0 → 2.8 + 1 rare bulle Shimmer magenta qui passe toutes les ~17 s) au lieu de 3 bulles uniformes.
  - **Wobble organique** : animation `cx` indépendante du chemin, avec valeurs en nombres premiers entre eux (2.7s, 1.9s, 1.7s, 2.3s, 2.5s) → aucune périodicité ne se synchronise, mouvement réellement chaotique.

### Ajouté — Goutte qui tombe sous le slot central
Détail signature des labos chimiques d'Arcane. Une goutte verte se forme à la base du cadre, dangle, s'allonge sous son poids, tombe, et se disperse en cycle de 5 s. 5 phases distinctes de keyframes (formation, dangle, élongation, chute, dispersion). Posée via `::after` sur `#slots` (élément stable du DOM) plutôt que sur `.slot.is-current` qui est recréé à chaque navigation.

### Ajouté — Vignettage interne du cadre
Inset shadow vert sombre sur `.slot-frame-inner` du slot central → simule le résidu chimique accumulé sur les bords du "verre" de la fiole. Subtil mais ajoute du grain au look "fiole sale" qui distingue Zaun d'un cadre propre.

---

## [1.2.1] — 2026-04-27

### Ajouté
- **Troisième forme de cadre : `circle` (rond ⚪)**, en plus de `rounded` (carré arrondi) et `hexagonal` (⬡). Implémentée via `border-radius: 50%` sur les deux wrappers du pattern double-cadre, donnant un anneau de bordure de 3 px parfaitement uniforme. Combinable avec n'importe quel thème.
- Les positions des badges (`#N` et pastilles ✓ / ⏳) sont automatiquement recentrées horizontalement en mode `circle` (mêmes règles que `hexagonal`) pour rester sur la zone visible — les coins du carré sont clippés dans les deux cas.
- `Settings.ENUM_VALUES.slotShape` étendu à `['rounded', 'hexagonal', 'circle']`.
- Option Rond ⚪ ajoutée dans le dropdown du panneau de contrôle.

---

## [1.2.0] — 2026-04-27

### ☣ Nouveau thème : **Zaun / Shimmer**

Les bas-fonds chimiques de Piltover. Pas un "Hextech en vert" — une vraie identité visuelle distincte, fidèle à l'univers de Singed, Twitch, Zac, Warwick, et de la série Arcane.

### Ajouté
- **Thème `zaun`** dans `css/themes/zaun.css` (~170 lignes), activable depuis le panneau `Apparence`.
  - Palette : vert chimique (`#5fc46e`), jaune-acide (`#9eff5f`), vert sombre industriel (`#1a4a25`), magenta Shimmer (`#d943c4`).
  - Cadre central en dégradé toxique (vert clair en haut → vert sombre en bas).
  - **Pulse plus rapide** que Hextech (3.8s vs 4.5s) avec **shift chromatique** vers jaune-acide au peak → effet "réaction chimique instable".
  - **Champions joués marqués en magenta Shimmer** au lieu de vert (vu que vert est la couleur dominante du thème) → contraste fort + référence à la drogue d'Arcane.
  - Nom du champion en vert acide avec **flicker très rare** (~70 ms toutes les 7 s) → ambiance enseigne néon défectueuse.
  - Compteur global en vert toxique sur fond noir-vert.
- **Smogstream** (`#smog-stream` dans `overlay.html`) : équivalent Zaun du Hexstream, avec une identité visuelle distincte :
  - Filament en **pipe industrielle dashée** (`stroke-dasharray="3 5"`) qui s'écoule en continu (`stroke-dashoffset` animé) — pas un filament magique poli.
  - Particules en forme de **bulles** (cercles avec `stroke` + `fill` semi-transparent) qui **remontent** le long du chemin (`keyPoints="1;0"` inverse la direction) — vapeurs toxiques qui s'élèvent au lieu de magie qui dérive.
  - Le radius des bulles est **animé** indépendamment du déplacement → effet "bulle qui respire" en plus du mouvement, plus organique.
  - Glow plus diffus que Hextech (`feGaussianBlur stdDeviation="2.2"` vs `1.6`) → vapeur diffuse plutôt que lumière nette.
- `Settings.ENUM_VALUES.theme` étendu à `['default', 'hextech', 'zaun']`.
- Option Zaun ajoutée dans le dropdown du panneau de contrôle.

### Sous le capot
- Le `#smog-stream` réutilise la même viewBox et la même structure de path que le `#hex-stream` pour cohérence structurelle, mais avec ses propres particules (timings, couleurs, formes, sens) → l'architecture des thèmes facilite la duplication tout en permettant une vraie différenciation.

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

[1.3.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v1.3.0
[1.2.1]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v1.2.1
[1.2.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v1.2.0
[1.1.1]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v1.1.1
[1.1.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v1.1.0
[1.0.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v1.0.0
[0.5.1]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.5.1
[0.5.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.5.0
[0.4.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.4.0
[0.3.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.3.0
[0.2.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.2.0
[0.1.0]: https://github.com/AlexkyTD/Lolphabet/releases/tag/v0.1.0

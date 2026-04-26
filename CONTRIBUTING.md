# Contribuer à Lolphabet

Merci de t'intéresser au projet ! Toute contribution est la bienvenue, même si tu débutes.

---

## 🐛 Signaler un bug

Le moyen le plus simple est d'ouvrir une [issue GitHub](https://github.com/AlexkyTD/Lolphabet/issues/new/choose) avec le template "Bug report".

Ce qu'on aimerait voir dans ton rapport :
- Ta version d'OBS et de Windows / macOS
- Une description précise de ce qui ne marche pas
- Les étapes pour reproduire le bug
- Si possible, une capture d'écran

---

## 💡 Proposer une nouvelle fonctionnalité

Ouvre une [issue GitHub](https://github.com/AlexkyTD/Lolphabet/issues/new/choose) avec le template "Feature request".

Avant d'écrire du code, c'est mieux d'en parler dans une issue d'abord — comme ça on peut discuter de l'approche.

---

## 🎯 Corriger un poste mal assigné

Le mapping champion → poste se trouve dans **[`js/positions-data.js`](./js/positions-data.js)**.

C'est le type de contribution la plus simple — pas besoin de connaître JS :

1. **Fork** le repo sur GitHub
2. Édite le fichier `js/positions-data.js`
3. Trouve la ligne du champion concerné, change la valeur :
   ```js
   Aatrox: 'top',  // change en 'jungle' par exemple
   ```
   Valeurs possibles : `'top'`, `'jungle'`, `'mid'`, `'adc'`, `'support'`
4. Ouvre une **Pull Request** avec un titre clair (ex. `Fix Aatrox position: top → jungle`)

Si plusieurs corrections en une fois, regroupe-les dans la même PR.

---

## 🆕 Ajouter un nouveau champion

Quand Riot sort un nouveau champion, l'app le détecte automatiquement via Data Dragon. Mais pour qu'il apparaisse dans le **tri par poste**, il faut l'ajouter à `js/positions-data.js`.

1. Récupère son ID Data Dragon (souvent son nom sans accents/espaces — par exemple `Aurora`, `Mel`, `Ambessa`)
2. Ajoute une entrée dans la liste, au bon endroit alphabétique :
   ```js
   Mel: 'mid',
   ```
3. Pull Request

---

## 🛠️ Modifier le code

### Setup local

Aucun outil à installer. Clone le repo et c'est parti :

```bash
git clone https://github.com/AlexkyTD/Lolphabet.git
cd Lolphabet
```

Pour développer :
- **Édite directement les fichiers** avec ton éditeur préféré
- **Double-clique sur `control.html`** dans Edge / Chrome pour tester le panneau
- **Double-clique sur `overlay.html`** dans le même navigateur pour tester l'overlay
- Les deux pages se synchronisent via `localStorage` / `BroadcastChannel`

> ⚠️ **Note Firefox** : Firefox isole chaque fichier `file://` dans une origine séparée. Edge et Chrome partagent le `localStorage` entre fichiers du même dossier, donc utilise plutôt l'un de ces deux navigateurs pour tester.

### Convention de code

- **JavaScript vanilla** uniquement, pas de framework, pas de build step.
- Tout vit dans `window.Lolphabet.*` (namespace global).
- Chaque module est un IIFE auto-contenu.
- Les commentaires sont **en français**, en cohérence avec le reste de la base.
- Le CSS utilise des **variables CSS** pour les couleurs / tailles principales.

### Règles de PR

1. Une PR = un sujet (ne mélange pas plusieurs features dans une PR).
2. Décris **ce que ça change** et **pourquoi** dans la description.
3. Si tu ajoutes une option d'affichage, suis le pattern existant : ajouter un toggle dans `control.html`, le wirer dans `control.js`, ajouter le default dans `settings.js`, ajouter la classe CSS dans `overlay.css` + l'application dans `overlay.js`.
4. Mets à jour le `CHANGELOG.md` à la section "À paraître" (ou crée la section si elle n'existe pas).

---

## 📜 Licence

En soumettant une contribution, tu acceptes qu'elle soit publiée sous la même [licence MIT](./LICENSE) que le reste du projet.

---

Merci pour ton aide ! 🙌

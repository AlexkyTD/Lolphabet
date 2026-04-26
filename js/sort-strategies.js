/**
 * sort-strategies.js
 * -----------------------------------------------------------------
 * Stratégies de tri de la liste des champions.
 *
 * Chaque stratégie prend en entrée la liste brute des champions
 * (telle que renvoyée par DataDragon.load) et renvoie une nouvelle
 * liste triée. La stratégie ne mute jamais la liste d'entrée.
 *
 * Exposé sur l'objet global : window.Lolphabet.Sort
 *
 * API publique :
 *   Sort.apply(mode, champions) -> Champion[] (triés)
 *   Sort.labels                 -> { mode: "Nom affiché" }
 *
 * Modes supportés :
 *   - "alpha"    : ordre alphabétique du nom localisé (fr)
 *   - "release"  : ordre de sortie (basé sur l'ID numérique Data Dragon,
 *                  qui est attribué de façon croissante avec la sortie
 *                  des champions)
 *   - "role"     : groupé par tags[0] dans l'ordre Fighter/Tank/Assassin/
 *                  Mage/Marksman/Support, alpha à l'intérieur de chaque rôle
 *   - "position" : groupé par poste via Lolphabet.Positions (top/jungle/mid/
 *                  adc/support), alpha à l'intérieur. Champions non mappés
 *                  → bucket "other" en fin de liste.
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  window.Lolphabet = window.Lolphabet || {};

  // Ordre d'affichage des rôles Data Dragon dans le tri "role".
  const ROLE_ORDER = ['Fighter', 'Tank', 'Assassin', 'Mage', 'Marksman', 'Support'];

  const ROLE_LABELS_FR = {
    Fighter: 'Combattant',
    Tank: 'Tank',
    Assassin: 'Assassin',
    Mage: 'Mage',
    Marksman: 'Tireur',
    Support: 'Support',
  };

  /**
   * Tri alphabétique sur le nom localisé, en respectant les accents
   * et la casse française.
   */
  function sortAlpha(champions) {
    return champions
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  }

  /**
   * Tri par ordre de sortie.
   *
   * On utilise le champ `key` de Data Dragon (l'ID numérique Riot),
   * qui est attribué de façon croissante avec la sortie des
   * champions. Ce n'est pas exactement l'ordre de release (certains
   * IDs ont pu être réservés puis utilisés plus tard), mais c'est
   * une excellente approximation qui ne requiert aucune donnée
   * externe.
   */
  function sortRelease(champions) {
    return champions
      .slice()
      .sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10));
  }

  /**
   * Tri par rôle principal.
   *
   * Le rôle principal est le premier tag de `champion.tags` fourni
   * par Data Dragon. On groupe les champions par rôle en suivant
   * ROLE_ORDER, puis à l'intérieur de chaque groupe on trie
   * alphabétiquement.
   */
  function sortRole(champions) {
    const buckets = new Map(ROLE_ORDER.map((r) => [r, []]));
    const other = [];

    for (const c of champions) {
      const role = (c.tags && c.tags[0]) || null;
      if (role && buckets.has(role)) {
        buckets.get(role).push(c);
      } else {
        other.push(c);
      }
    }

    const result = [];
    for (const role of ROLE_ORDER) {
      const list = buckets.get(role) || [];
      list.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
      result.push(...list);
    }
    other.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    result.push(...other);
    return result;
  }

  /**
   * Tri par poste (top/jungle/mid/adc/support).
   *
   * Utilise la table `Lolphabet.Positions` chargée depuis
   * `js/positions-data.js`. Les champions non mappés tombent dans
   * un bucket "other" à la fin. À l'intérieur de chaque poste, tri
   * alphabétique.
   */
  function sortPosition(champions) {
    const Positions = window.Lolphabet.Positions;
    if (!Positions) {
      console.warn('[Lolphabet] positions-data.js non chargé, fallback sur alpha.');
      return sortAlpha(champions);
    }

    const order = [...Positions.POSITION_ORDER, 'other'];
    const buckets = new Map(order.map((p) => [p, []]));

    for (const c of champions) {
      const pos = Positions.get(c.id);
      const bucket = buckets.has(pos) ? pos : 'other';
      buckets.get(bucket).push(c);
    }

    const result = [];
    for (const pos of order) {
      const list = buckets.get(pos) || [];
      list.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
      result.push(...list);
    }
    return result;
  }

  const strategies = {
    alpha: sortAlpha,
    release: sortRelease,
    role: sortRole,
    position: sortPosition,
  };

  const labels = {
    alpha: 'Ordre alphabétique',
    release: 'Ordre de sortie',
    role: 'Rôle principal',
    position: 'Poste',
  };

  /**
   * Applique la stratégie de tri correspondant au mode.
   * @param {string} mode
   * @param {Champion[]} champions
   * @returns {Champion[]}
   */
  function apply(mode, champions) {
    const strategy = strategies[mode];
    if (!strategy) {
      throw new Error(`Mode de tri inconnu : ${mode}`);
    }
    return strategy(champions);
  }

  window.Lolphabet.Sort = {
    apply,
    labels,
  };
})();

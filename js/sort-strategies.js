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
 *   - "alpha"    : ordre alphabétique du nom localisé (MVP v0.1)
 *   - "release"  : ordre de sortie (v0.2 — non implémenté)
 *   - "role"     : par rôle principal puis alpha (v0.2 — non implémenté)
 *   - "position" : par poste (top/jungle/mid/adc/support) puis alpha (v0.2 — non implémenté)
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  window.Lolphabet = window.Lolphabet || {};

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
   * Placeholder : tri par ordre de sortie. Sera implémenté en v0.2
   * via un fichier de données `data/release-order.json`.
   */
  function sortRelease(champions) {
    console.warn('[Lolphabet] Tri "release" non encore implémenté, fallback sur alpha.');
    return sortAlpha(champions);
  }

  /**
   * Placeholder : tri par rôle principal. Sera implémenté en v0.2
   * en utilisant `champion.tags[0]` puis tri alpha à l'intérieur.
   */
  function sortRole(champions) {
    console.warn('[Lolphabet] Tri "role" non encore implémenté, fallback sur alpha.');
    return sortAlpha(champions);
  }

  /**
   * Placeholder : tri par poste (top/jungle/mid/adc/support). Sera
   * implémenté en v0.2 via `data/positions.json` (liste communautaire).
   */
  function sortPosition(champions) {
    console.warn('[Lolphabet] Tri "position" non encore implémenté, fallback sur alpha.');
    return sortAlpha(champions);
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

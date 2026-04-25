/**
 * settings.js
 * -----------------------------------------------------------------
 * Préférences d'affichage de l'overlay (séparées de la progression).
 *
 * Permet au streameur de personnaliser visuellement son overlay
 * sans toucher au code : afficher ou non les numéros de position
 * de chaque champion, flouter ou non les prochains champions, etc.
 *
 * Les préférences sont persistées dans localStorage (clé séparée
 * de l'état de progression) et diffusées entre l'overlay et le
 * panneau de contrôle via le bus.
 *
 * Exposé sur l'objet global : window.Lolphabet.Settings
 *
 * Forme des settings :
 *   {
 *     showPositionNumbers: boolean,  // affiche #N sur chaque icône
 *     blurUpcoming:        boolean,  // floute l'image des 2 prochains
 *     showGlobalCounter:   boolean,  // compteur 42 / 168 en haut à droite
 *     markPastPlayed:      boolean,  // ✓ vert + cadre vert sur les joués
 *     markUpcoming:        boolean,  // ⏳ sablier sur les à venir
 *   }
 *
 * API publique :
 *   Settings.STORAGE_KEY            -> clé localStorage utilisée
 *   Settings.DEFAULTS               -> valeurs par défaut
 *   Settings.load()                 -> charge depuis localStorage
 *   Settings.save()                 -> écrit l'état courant sur disque
 *   Settings.get()                  -> renvoie l'objet courant
 *   Settings.set(key, value)        -> modifie une préférence + sauvegarde
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  window.Lolphabet = window.Lolphabet || {};

  const STORAGE_KEY = 'lolphabet.settings.v1';

  const DEFAULTS = Object.freeze({
    showPositionNumbers: true,
    blurUpcoming: false,
    showGlobalCounter: false,
    markPastPlayed: false,
    markUpcoming: false,
  });

  let current = { ...DEFAULTS };

  /**
   * Normalise un objet brut lu depuis localStorage : remplit les
   * champs manquants avec les valeurs par défaut, et ignore les
   * champs inconnus.
   */
  function normalize(raw) {
    const out = { ...DEFAULTS };
    if (!raw || typeof raw !== 'object') return out;
    for (const key of Object.keys(DEFAULTS)) {
      if (typeof raw[key] === typeof DEFAULTS[key]) {
        out[key] = raw[key];
      }
    }
    return out;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      current = normalize(raw ? JSON.parse(raw) : null);
    } catch (err) {
      console.warn('[Lolphabet] Settings corrompus, retour aux valeurs par défaut.', err);
      current = { ...DEFAULTS };
    }
    return current;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (err) {
      console.warn('[Lolphabet] Impossible d\'écrire les settings.', err);
    }
  }

  function get() {
    return current;
  }

  function set(key, value) {
    if (!(key in DEFAULTS)) {
      throw new Error(`Setting inconnu : ${key}`);
    }
    if (typeof value !== typeof DEFAULTS[key]) {
      throw new Error(`Type invalide pour ${key} (attendu ${typeof DEFAULTS[key]})`);
    }
    current[key] = value;
    save();
  }

  window.Lolphabet.Settings = {
    STORAGE_KEY,
    DEFAULTS,
    load,
    save,
    get,
    set,
  };
})();

/**
 * state.js
 * -----------------------------------------------------------------
 * Gestion de l'état persistant de Lolphabet.
 *
 * L'état est conservé dans localStorage sous une clé unique, et
 * contient une "instance" indépendante par mode de tri — ainsi, si
 * l'utilisateur change de tri puis revient au tri précédent, il
 * reprend à la position où il en était.
 *
 * Exposé sur l'objet global : window.Lolphabet.State
 *
 * Forme de l'état :
 *   {
 *     currentSortMode: "alpha" | "release" | "role" | "position",
 *     instances: {
 *       alpha:    { index: 0, updatedAt: null | ISOString },
 *       release:  { index: 0, updatedAt: null | ISOString },
 *       role:     { index: 0, updatedAt: null | ISOString },
 *       position: { index: 0, updatedAt: null | ISOString }
 *     }
 *   }
 *
 * API publique :
 *   State.load()                   -> charge depuis localStorage (ou défaut)
 *   State.save()                   -> écrit l'état courant sur disque
 *   State.get()                    -> renvoie l'état complet (lecture seule)
 *   State.getSortMode()            -> renvoie le mode de tri actif
 *   State.setSortMode(mode)        -> change le mode de tri actif
 *   State.getIndex()               -> renvoie l'index de l'instance active
 *   State.setIndex(i)              -> fixe l'index de l'instance active
 *   State.resetCurrent()           -> reset l'instance du mode de tri actif
 *   State.SORT_MODES               -> liste des modes de tri valides
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  window.Lolphabet = window.Lolphabet || {};

  const STORAGE_KEY = 'lolphabet.state.v1';

  const SORT_MODES = ['alpha', 'release', 'role', 'position'];

  /**
   * Construit un état vide avec une instance par mode.
   */
  function makeDefaultState() {
    const instances = {};
    for (const mode of SORT_MODES) {
      instances[mode] = { index: 0, updatedAt: null };
    }
    return {
      currentSortMode: 'alpha',
      instances,
    };
  }

  /**
   * Valide et complète un état lu depuis localStorage. Si des champs
   * manquent (par exemple un nouveau mode de tri ajouté dans une
   * version ultérieure), on les remplit avec les valeurs par défaut.
   */
  function normalizeState(raw) {
    const def = makeDefaultState();
    if (!raw || typeof raw !== 'object') return def;

    const normalized = {
      currentSortMode: SORT_MODES.includes(raw.currentSortMode)
        ? raw.currentSortMode
        : def.currentSortMode,
      instances: { ...def.instances },
    };

    if (raw.instances && typeof raw.instances === 'object') {
      for (const mode of SORT_MODES) {
        const inst = raw.instances[mode];
        if (inst && typeof inst === 'object' && Number.isFinite(inst.index)) {
          normalized.instances[mode] = {
            index: Math.max(0, Math.floor(inst.index)),
            updatedAt: typeof inst.updatedAt === 'string' ? inst.updatedAt : null,
          };
        }
      }
    }

    return normalized;
  }

  // --- État en mémoire -----------------------------------------------------

  let currentState = makeDefaultState();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      currentState = normalizeState(raw ? JSON.parse(raw) : null);
    } catch (err) {
      console.warn('[Lolphabet] État corrompu, reset aux valeurs par défaut.', err);
      currentState = makeDefaultState();
    }
    return currentState;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (err) {
      console.warn('[Lolphabet] Impossible d\'écrire l\'état.', err);
    }
  }

  function get() {
    return currentState;
  }

  // --- Sort mode -----------------------------------------------------------

  function getSortMode() {
    return currentState.currentSortMode;
  }

  function setSortMode(mode) {
    if (!SORT_MODES.includes(mode)) {
      throw new Error(`Mode de tri inconnu : ${mode}`);
    }
    currentState.currentSortMode = mode;
    save();
  }

  // --- Index de l'instance active ------------------------------------------

  function getIndex() {
    return currentState.instances[currentState.currentSortMode].index;
  }

  function setIndex(i) {
    if (!Number.isFinite(i)) {
      throw new Error(`Index invalide : ${i}`);
    }
    const mode = currentState.currentSortMode;
    currentState.instances[mode] = {
      index: Math.max(0, Math.floor(i)),
      updatedAt: new Date().toISOString(),
    };
    save();
  }

  function resetCurrent() {
    const mode = currentState.currentSortMode;
    currentState.instances[mode] = {
      index: 0,
      updatedAt: new Date().toISOString(),
    };
    save();
  }

  // --- Export --------------------------------------------------------------

  window.Lolphabet.State = {
    SORT_MODES,
    load,
    save,
    get,
    getSortMode,
    setSortMode,
    getIndex,
    setIndex,
    resetCurrent,
  };
})();

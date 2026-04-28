/**
 * bus.js
 * -----------------------------------------------------------------
 * Fin wrapper autour de BroadcastChannel pour diffuser les
 * changements d'état entre l'overlay (chargé dans OBS) et le
 * panneau de contrôle (ouvert dans un autre onglet / fenêtre).
 *
 * Les deux pages doivent être servies depuis la MÊME ORIGINE pour
 * que BroadcastChannel fonctionne (y compris en file://, tant que
 * les deux pages sont ouvertes dans le même navigateur).
 *
 * En complément, on utilise aussi l'event "storage" du localStorage
 * comme filet de secours : certains contextes (notamment OBS CEF)
 * peuvent avoir un BroadcastChannel limité. Écrire dans
 * localStorage.setItem déclenche un event "storage" sur les autres
 * pages de la même origine.
 *
 * Exposé sur l'objet global : window.Lolphabet.Bus
 *
 * API publique :
 *   Bus.publish(eventName, payload)  -> diffuse un message
 *   Bus.subscribe(eventName, cb)     -> écoute un message
 *                                       (cb reçoit le payload)
 *
 * Événements utilisés dans Lolphabet :
 *   - "state-changed"     : la progression / mode de tri a changé
 *     payload = { sortMode, index, reason }
 *   - "settings-changed"  : une préférence d'affichage a changé
 *     payload = { key, value }
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  window.Lolphabet = window.Lolphabet || {};

  const CHANNEL_NAME = 'lolphabet';
  const STORAGE_PING_KEY = 'lolphabet.bus.ping.v1';

  const listeners = new Map(); // eventName -> Set<callback>

  // --- BroadcastChannel ----------------------------------------------------

  let channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.addEventListener('message', (ev) => {
        dispatch(ev.data);
      });
    }
  } catch (err) {
    console.warn('[Lolphabet] BroadcastChannel indisponible.', err);
  }

  // --- Fallback via event "storage" ---------------------------------------

  window.addEventListener('storage', (ev) => {
    if (ev.key !== STORAGE_PING_KEY || !ev.newValue) return;
    try {
      const msg = JSON.parse(ev.newValue);
      dispatch(msg);
    } catch (_) {
      // no-op
    }
  });

  /**
   * Dispatch un message reçu vers les listeners enregistrés.
   */
  function dispatch(msg) {
    if (!msg || typeof msg.event !== 'string') return;
    const set = listeners.get(msg.event);
    if (!set) return;
    for (const cb of set) {
      try {
        cb(msg.payload);
      } catch (err) {
        console.error('[Lolphabet] Listener a levé une exception.', err);
      }
    }
  }

  /**
   * Publie un message sur le bus.
   * @param {string} event - nom de l'événement
   * @param {*} payload - données associées
   */
  function publish(event, payload) {
    const msg = { event, payload, ts: Date.now() };

    if (channel) {
      try {
        channel.postMessage(msg);
      } catch (err) {
        console.warn('[Lolphabet] BroadcastChannel.postMessage a échoué.', err);
      }
    }

    // Double canal via localStorage : on écrit puis efface pour
    // garantir qu'une valeur identique consécutive déclenche bien
    // l'event "storage" chez les autres pages.
    try {
      localStorage.setItem(STORAGE_PING_KEY, JSON.stringify(msg));
      localStorage.removeItem(STORAGE_PING_KEY);
    } catch (err) {
      // no-op
    }
  }

  /**
   * S'abonne à un événement. Renvoie une fonction de désabonnement.
   * @param {string} event
   * @param {(payload: any) => void} cb
   * @returns {() => void}
   */
  function subscribe(event, cb) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(cb);
    return () => {
      const set = listeners.get(event);
      if (set) set.delete(cb);
    };
  }

  window.Lolphabet.Bus = {
    publish,
    subscribe,
  };
})();

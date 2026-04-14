/**
 * overlay.js
 * -----------------------------------------------------------------
 * Logique de l'overlay : charge la liste des champions, trie selon
 * le mode courant, et rend le carrousel de 5 slots visibles (-2, -1,
 * 0, +1, +2) avec une animation de glissement à chaque changement
 * d'index.
 *
 * L'overlay écoute le bus pour réagir aux changements envoyés
 * depuis le panneau de contrôle, et se ré-initialise depuis le
 * localStorage au chargement.
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  const { DataDragon, Sort, State, Bus } = window.Lolphabet;

  // Layout des slots : offset → { translateY (px), scale, opacity }
  // Les offsets |>2| existent pour que les slots puissent entrer/sortir
  // du cadre en douceur pendant l'animation.
  const LAYOUT = {
    '-3': { y: -420, scale: 1 / 3, opacity: 0 },
    '-2': { y: -280, scale: 1 / 3, opacity: 1 },
    '-1': { y: -170, scale: 2 / 3, opacity: 1 },
    '0':  { y:    0, scale: 1,     opacity: 1 },
    '1':  { y:  170, scale: 2 / 3, opacity: 1 },
    '2':  { y:  280, scale: 1 / 3, opacity: 1 },
    '3':  { y:  420, scale: 1 / 3, opacity: 0 },
  };

  // Offsets visibles (ceux qu'on rend réellement dans le DOM).
  const VISIBLE_RANGE = [-3, -2, -1, 0, 1, 2, 3];

  // --- État interne --------------------------------------------------------

  let champions = [];        // liste triée selon le mode courant
  let slotsEl = null;
  let nameEl = null;

  // Map championId -> { element, offset }
  const slotPool = new Map();

  // --- Helpers -------------------------------------------------------------

  function applyLayout(el, offset) {
    const key = String(Math.max(-3, Math.min(3, offset)));
    const l = LAYOUT[key];
    el.style.transform = `translate(-50%, -50%) translateY(${l.y}px) scale(${l.scale})`;
    el.style.opacity = String(l.opacity);
    el.style.left = '50%';
    el.style.top = '50%';
  }

  function createSlotElement(champion) {
    const el = document.createElement('div');
    el.className = 'slot';
    el.dataset.championId = champion.id;

    const img = document.createElement('img');
    img.src = champion.iconUrl;
    img.alt = champion.name;
    img.draggable = false;
    el.appendChild(img);

    return el;
  }

  /**
   * Rend (ou met à jour) le carrousel pour l'index courant.
   * Les champions dont |offset| <= 3 sont présents dans le DOM ;
   * les autres sont retirés à la fin de l'animation.
   */
  function render() {
    if (!champions.length) return;

    const currentIndex = State.getIndex() % champions.length;
    const current = champions[currentIndex];
    nameEl.textContent = current ? current.name : '';

    // Pour chaque offset visible, on s'assure qu'un slot existe
    // pour le champion correspondant.
    const keepIds = new Set();

    for (const offset of VISIBLE_RANGE) {
      const i = ((currentIndex + offset) % champions.length + champions.length) % champions.length;
      const champ = champions[i];
      keepIds.add(champ.id);

      let entry = slotPool.get(champ.id);
      if (!entry) {
        const el = createSlotElement(champ);
        slotsEl.appendChild(el);
        // On positionne d'abord le slot à son offset actuel *sans*
        // transition pour éviter un flash d'animation à l'arrivée.
        el.style.transition = 'none';
        applyLayout(el, offset);
        // Force un reflow, puis réactive la transition.
        void el.offsetWidth;
        el.style.transition = '';
        entry = { element: el, offset };
        slotPool.set(champ.id, entry);
      } else {
        entry.offset = offset;
        applyLayout(entry.element, offset);
      }

      entry.element.classList.toggle('is-current', offset === 0);
    }

    // Nettoyage : les slots plus affichés sont retirés (après un
    // petit délai pour laisser l'animation finir s'ils s'éloignent).
    for (const [id, entry] of slotPool) {
      if (!keepIds.has(id)) {
        const el = entry.element;
        el.style.opacity = '0';
        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
          slotPool.delete(id);
        }, 400);
      }
    }
  }

  function reloadChampions() {
    const mode = State.getSortMode();
    const all = window.Lolphabet._rawChampions || [];
    champions = Sort.apply(mode, all);
  }

  /**
   * Re-render complet (après changement de mode de tri par exemple).
   * On purge le pool pour que le render suivant reparte propre.
   */
  function hardRefresh() {
    for (const [, entry] of slotPool) {
      if (entry.element.parentNode) {
        entry.element.parentNode.removeChild(entry.element);
      }
    }
    slotPool.clear();
    reloadChampions();
    render();
  }

  // --- Init ----------------------------------------------------------------

  async function init() {
    slotsEl = document.getElementById('slots');
    nameEl = document.getElementById('champion-name');

    State.load();

    try {
      const all = await DataDragon.load();
      window.Lolphabet._rawChampions = all;
    } catch (err) {
      nameEl.textContent = 'Erreur Data Dragon';
      console.error(err);
      return;
    }

    reloadChampions();
    render();

    Bus.subscribe('state-changed', (payload) => {
      if (!payload) return;
      State.load(); // re-lecture depuis localStorage (source de vérité)
      if (payload.reason === 'sort-changed') {
        hardRefresh();
      } else {
        render();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

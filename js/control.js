/**
 * control.js
 * -----------------------------------------------------------------
 * Logique du panneau de contrôle : affiche le champion actuel,
 * pilote l'index via les boutons Précédent / Suivant / Reset /
 * Sauter à, et permet de changer le mode de tri.
 *
 * Chaque changement d'état est persisté via State.save() (implicite)
 * puis diffusé à l'overlay via Bus.publish("state-changed", ...).
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  const { DataDragon, Sort, State, Settings, Bus } = window.Lolphabet;

  // --- État interne --------------------------------------------------------

  let allChampions = [];     // liste brute (non triée)
  let champions = [];        // liste triée selon le mode courant

  // --- DOM refs ------------------------------------------------------------

  const el = {};
  function cacheDom() {
    el.currentImg    = document.getElementById('currentImg');
    el.currentName   = document.getElementById('currentName');
    el.currentTitle  = document.getElementById('currentTitle');
    el.currentProg   = document.getElementById('currentProg');
    el.prevBtn       = document.getElementById('prevBtn');
    el.nextBtn       = document.getElementById('nextBtn');
    el.resetBtn      = document.getElementById('resetBtn');
    el.sortSelect    = document.getElementById('sortSelect');
    el.optPositionNumbers   = document.getElementById('optPositionNumbers');
    el.optBlurUpcoming      = document.getElementById('optBlurUpcoming');
    el.optGlobalCounter     = document.getElementById('optGlobalCounter');
    el.optMarkPastPlayed    = document.getElementById('optMarkPastPlayed');
    el.optMarkUpcoming      = document.getElementById('optMarkUpcoming');
    el.jumpInput     = document.getElementById('jumpInput');
    el.jumpList      = document.getElementById('jumpList');
    el.status        = document.getElementById('status');
  }

  // --- Helpers -------------------------------------------------------------

  function publishChange(reason) {
    Bus.publish('state-changed', {
      sortMode: State.getSortMode(),
      index: State.getIndex(),
      reason,
    });
  }

  function refreshSortedList() {
    champions = Sort.apply(State.getSortMode(), allChampions);
    // Si l'instance du tri courant est un index trop grand (ce qui
    // ne devrait pas arriver puisque la liste fait ~168 champions
    // dans tous les tris), on le clampe.
    if (State.getIndex() >= champions.length) {
      State.setIndex(0);
    }
  }

  function updateCurrent() {
    if (!champions.length) return;
    const idx = State.getIndex() % champions.length;
    const c = champions[idx];
    el.currentImg.src = c.iconUrl;
    el.currentImg.alt = c.name;
    el.currentName.textContent = c.name;
    el.currentTitle.textContent = c.title || '';
    el.currentProg.textContent = `${idx + 1} / ${champions.length}`;
  }

  // --- Actions -------------------------------------------------------------

  function next() {
    const n = champions.length;
    if (!n) return;
    State.setIndex((State.getIndex() + 1) % n);
    updateCurrent();
    publishChange('next');
  }

  function prev() {
    const n = champions.length;
    if (!n) return;
    State.setIndex((State.getIndex() - 1 + n) % n);
    updateCurrent();
    publishChange('prev');
  }

  function reset() {
    const mode = State.getSortMode();
    const ok = confirm(
      `Reset la progression du tri "${Sort.labels[mode]}" et revenir au premier champion ?`
    );
    if (!ok) return;
    State.resetCurrent();
    updateCurrent();
    publishChange('reset');
  }

  function jumpTo(index) {
    if (!Number.isFinite(index) || index < 0 || index >= champions.length) return;
    State.setIndex(index);
    updateCurrent();
    publishChange('jump');
    el.jumpInput.value = '';
    renderJumpSuggestions('');
  }

  function changeSort(newMode) {
    if (!State.SORT_MODES.includes(newMode)) return;
    State.setSortMode(newMode);
    refreshSortedList();
    updateCurrent();
    publishChange('sort-changed');
  }

  // --- Settings (options d'affichage) -------------------------------------

  function toggleSetting(key, value) {
    Settings.set(key, value);
    Bus.publish('settings-changed', { key, value });
  }

  function applySettingsToUI() {
    const s = Settings.get();
    el.optPositionNumbers.checked = s.showPositionNumbers;
    el.optBlurUpcoming.checked    = s.blurUpcoming;
    el.optGlobalCounter.checked   = s.showGlobalCounter;
    el.optMarkPastPlayed.checked  = s.markPastPlayed;
    el.optMarkUpcoming.checked    = s.markUpcoming;
  }

  // --- Recherche "sauter à" ------------------------------------------------

  function renderJumpSuggestions(query) {
    const q = query.trim().toLowerCase();
    el.jumpList.innerHTML = '';
    if (!q) return;

    const normalized = (s) =>
      s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const qn = normalized(q);

    const matches = [];
    for (let i = 0; i < champions.length; i++) {
      const c = champions[i];
      if (normalized(c.name).includes(qn)) {
        matches.push({ champion: c, index: i });
        if (matches.length >= 8) break;
      }
    }

    for (const { champion, index } of matches) {
      const row = document.createElement('div');
      row.className = 'suggestion';
      row.innerHTML =
        `<img src="${champion.iconUrl}" alt="">` +
        `<span class="name">${champion.name}</span>` +
        `<span class="index">#${index + 1}</span>`;
      row.addEventListener('click', () => jumpTo(index));
      el.jumpList.appendChild(row);
    }
  }

  // --- Init ----------------------------------------------------------------

  async function init() {
    cacheDom();
    State.load();
    Settings.load();
    applySettingsToUI();

    // Sort mode select : on remplit avec les labels
    for (const mode of State.SORT_MODES) {
      const opt = document.createElement('option');
      opt.value = mode;
      opt.textContent = Sort.labels[mode];
      el.sortSelect.appendChild(opt);
    }
    el.sortSelect.value = State.getSortMode();

    try {
      allChampions = await DataDragon.load();
      el.status.textContent = `${allChampions.length} champions chargés.`;
    } catch (err) {
      el.status.textContent = 'Erreur Data Dragon : ' + err.message;
      el.status.classList.add('err');
      console.error(err);
      return;
    }

    refreshSortedList();
    updateCurrent();

    // --- Events ---
    el.nextBtn.addEventListener('click', next);
    el.prevBtn.addEventListener('click', prev);
    el.resetBtn.addEventListener('click', reset);
    el.sortSelect.addEventListener('change', (e) => changeSort(e.target.value));
    el.optPositionNumbers.addEventListener('change', (e) =>
      toggleSetting('showPositionNumbers', e.target.checked));
    el.optBlurUpcoming.addEventListener('change', (e) =>
      toggleSetting('blurUpcoming', e.target.checked));
    el.optGlobalCounter.addEventListener('change', (e) =>
      toggleSetting('showGlobalCounter', e.target.checked));
    el.optMarkPastPlayed.addEventListener('change', (e) =>
      toggleSetting('markPastPlayed', e.target.checked));
    el.optMarkUpcoming.addEventListener('change', (e) =>
      toggleSetting('markUpcoming', e.target.checked));
    el.jumpInput.addEventListener('input', (e) => renderJumpSuggestions(e.target.value));
    el.jumpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = el.jumpList.querySelector('.suggestion');
        if (first) first.click();
      } else if (e.key === 'Escape') {
        el.jumpInput.value = '';
        renderJumpSuggestions('');
      }
    });

    // Raccourcis clavier simples (actifs quand la fenêtre est focus)
    document.addEventListener('keydown', (e) => {
      if (document.activeElement === el.jumpInput) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * data-dragon.js
 * -----------------------------------------------------------------
 * Module en charge de récupérer la liste des champions de League of
 * Legends depuis l'API publique Data Dragon de Riot Games, et de la
 * mettre en cache dans localStorage pour éviter de re-télécharger à
 * chaque ouverture.
 *
 * Exposé sur l'objet global : window.Lolphabet.DataDragon
 *
 * API publique :
 *   - DataDragon.load()  -> Promise<Champion[]>
 *       Charge la liste des champions (cache si dispo et à jour,
 *       sinon fetch + met en cache).
 *   - DataDragon.clearCache()
 *       Supprime le cache local (utile pour forcer un refresh).
 *
 * Format d'un Champion :
 *   {
 *     id:      "Aatrox",         // identifiant technique (pour l'URL de l'icône)
 *     key:     "266",            // identifiant numérique Riot
 *     name:    "Aatrox",         // nom affiché (localisé fr_FR)
 *     title:   "l'Épée des Darkin",
 *     tags:    ["Fighter", "Tank"],
 *     iconUrl: "https://ddragon.leagueoflegends.com/cdn/14.7.1/img/champion/Aatrox.png"
 *   }
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  window.Lolphabet = window.Lolphabet || {};

  // --- Constantes ----------------------------------------------------------

  const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
  const CHAMPIONS_URL = (version) =>
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`;
  const ICON_URL = (version, championId) =>
    `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`;

  const CACHE_KEY = 'lolphabet.dataDragon.cache.v1';

  // --- Cache ---------------------------------------------------------------

  /**
   * Lit le cache depuis localStorage.
   * @returns {{version: string, champions: Champion[]} | null}
   */
  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.version || !Array.isArray(parsed.champions)) {
        return null;
      }
      return parsed;
    } catch (err) {
      console.warn('[Lolphabet] Cache corrompu, on l\'ignore.', err);
      return null;
    }
  }

  /**
   * Écrit le cache dans localStorage.
   */
  function writeCache(version, champions) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ version, champions, cachedAt: Date.now() })
      );
    } catch (err) {
      console.warn('[Lolphabet] Impossible d\'écrire le cache.', err);
    }
  }

  /**
   * Supprime le cache local.
   */
  function clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (err) {
      // no-op
    }
  }

  // --- Fetch ---------------------------------------------------------------

  /**
   * Récupère la dernière version du patch LoL publiée par Riot.
   * @returns {Promise<string>}
   */
  async function fetchLatestVersion() {
    const res = await fetch(VERSIONS_URL);
    if (!res.ok) {
      throw new Error(`Data Dragon versions HTTP ${res.status}`);
    }
    const versions = await res.json();
    if (!Array.isArray(versions) || versions.length === 0) {
      throw new Error('Data Dragon versions: réponse inattendue');
    }
    return versions[0]; // la plus récente en premier
  }

  /**
   * Récupère la liste brute des champions pour une version donnée,
   * et la normalise vers notre format interne.
   * @param {string} version
   * @returns {Promise<Champion[]>}
   */
  async function fetchChampions(version) {
    const res = await fetch(CHAMPIONS_URL(version));
    if (!res.ok) {
      throw new Error(`Data Dragon champions HTTP ${res.status}`);
    }
    const payload = await res.json();
    if (!payload || !payload.data) {
      throw new Error('Data Dragon champions: réponse inattendue');
    }

    const champions = Object.values(payload.data).map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      title: c.title,
      tags: Array.isArray(c.tags) ? c.tags.slice() : [],
      iconUrl: ICON_URL(version, c.id),
    }));

    return champions;
  }

  // --- API publique --------------------------------------------------------

  /**
   * Charge la liste des champions.
   *
   * Stratégie :
   *   1. On regarde le cache local.
   *   2. On interroge Data Dragon pour connaître la dernière version.
   *      - Si pas de réseau : on retombe sur le cache si dispo.
   *   3. Si la version du cache correspond à la dernière version : on
   *      renvoie le cache.
   *   4. Sinon : on fetch la nouvelle version, on met en cache, on renvoie.
   *
   * @returns {Promise<Champion[]>}
   */
  async function load() {
    const cached = readCache();

    let latestVersion;
    try {
      latestVersion = await fetchLatestVersion();
    } catch (err) {
      // Pas de réseau → si on a un cache, on s'en contente (mode dégradé).
      if (cached) {
        console.warn(
          '[Lolphabet] Pas de réseau, utilisation du cache local (version ' +
            cached.version +
            ').'
        );
        return cached.champions;
      }
      throw new Error(
        'Impossible de joindre Data Dragon et aucun cache local disponible.'
      );
    }

    if (cached && cached.version === latestVersion) {
      return cached.champions;
    }

    const champions = await fetchChampions(latestVersion);
    writeCache(latestVersion, champions);
    return champions;
  }

  // --- Export --------------------------------------------------------------

  window.Lolphabet.DataDragon = {
    load,
    clearCache,
  };
})();

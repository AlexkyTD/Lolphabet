/**
 * positions-data.js
 * -----------------------------------------------------------------
 * Mapping champion → poste principal (top, jungle, mid, adc, support).
 *
 * Cette liste est basée sur les postes les plus joués selon le méta
 * communautaire (u.gg, lolalytics, op.gg). De nombreux champions
 * sont flex et peuvent être joués à plusieurs postes — on retient
 * le poste **principal / le plus commun** en solo queue.
 *
 * Les IDs utilisés sont ceux de Data Dragon (attention aux
 * particularités : "MonkeyKing" pour Wukong, "Chogath", "Khazix",
 * "KSante", "Belveth", "DrMundo", "JarvanIV", "XinZhao",
 * "MasterYi", "MissFortune", "AurelionSol", "TwistedFate",
 * "LeeSin", "TahmKench", "Nunu", "KogMaw", "RekSai", "Velkoz",
 * "Kaisa", "Leblanc", "Renata").
 *
 * Tout champion non présent dans cette liste tombera dans un
 * bucket "other" à la fin du tri par poste. Si un nouveau champion
 * est ajouté par Riot, soit le tri alphabétique prend le relais
 * pour ce champion, soit une PR peut venir compléter cette liste.
 *
 * Contribution : si tu veux proposer une correction, édite ce
 * fichier et ouvre une PR sur le dépôt.
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  window.Lolphabet = window.Lolphabet || {};

  // Postes supportés et leur ordre d'affichage dans le tri.
  const POSITION_ORDER = ['top', 'jungle', 'mid', 'adc', 'support'];

  const POSITION_LABELS = {
    top: 'Top',
    jungle: 'Jungle',
    mid: 'Mid',
    adc: 'ADC',
    support: 'Support',
    other: 'Autre',
  };

  const POSITIONS = {
    Aatrox: 'top',
    Ahri: 'mid',
    Akali: 'mid',
    Akshan: 'mid',
    Alistar: 'support',
    Ambessa: 'top',
    Amumu: 'jungle',
    Anivia: 'mid',
    Annie: 'mid',
    Aphelios: 'adc',
    Ashe: 'adc',
    AurelionSol: 'mid',
    Aurora: 'mid',
    Azir: 'mid',
    Bard: 'support',
    Belveth: 'jungle',
    Blitzcrank: 'support',
    Brand: 'support',
    Braum: 'support',
    Briar: 'jungle',
    Caitlyn: 'adc',
    Camille: 'top',
    Cassiopeia: 'mid',
    Chogath: 'top',
    Corki: 'mid',
    Darius: 'top',
    Diana: 'jungle',
    DrMundo: 'top',
    Draven: 'adc',
    Ekko: 'jungle',
    Elise: 'jungle',
    Evelynn: 'jungle',
    Ezreal: 'adc',
    Fiddlesticks: 'jungle',
    Fiora: 'top',
    Fizz: 'mid',
    Galio: 'mid',
    Gangplank: 'top',
    Garen: 'top',
    Gnar: 'top',
    Gragas: 'top',
    Graves: 'jungle',
    Gwen: 'top',
    Hecarim: 'jungle',
    Heimerdinger: 'top',
    Hwei: 'mid',
    Illaoi: 'top',
    Irelia: 'top',
    Ivern: 'jungle',
    Janna: 'support',
    JarvanIV: 'jungle',
    Jax: 'top',
    Jayce: 'top',
    Jhin: 'adc',
    Jinx: 'adc',
    KSante: 'top',
    Kaisa: 'adc',
    Kalista: 'adc',
    Karma: 'support',
    Karthus: 'jungle',
    Kassadin: 'mid',
    Katarina: 'mid',
    Kayle: 'top',
    Kayn: 'jungle',
    Kennen: 'top',
    Khazix: 'jungle',
    Kindred: 'jungle',
    Kled: 'top',
    KogMaw: 'adc',
    Leblanc: 'mid',
    LeeSin: 'jungle',
    Leona: 'support',
    Lillia: 'jungle',
    Lissandra: 'mid',
    Lucian: 'adc',
    Lulu: 'support',
    Lux: 'support',
    Malphite: 'top',
    Malzahar: 'mid',
    Maokai: 'support',
    MasterYi: 'jungle',
    Mel: 'mid',
    Milio: 'support',
    MissFortune: 'adc',
    MonkeyKing: 'top', // Wukong
    Mordekaiser: 'top',
    Morgana: 'support',
    Naafiri: 'mid',
    Nami: 'support',
    Nasus: 'top',
    Nautilus: 'support',
    Neeko: 'mid',
    Nidalee: 'jungle',
    Nilah: 'adc',
    Nocturne: 'jungle',
    Nunu: 'jungle',
    Olaf: 'jungle',
    Orianna: 'mid',
    Ornn: 'top',
    Pantheon: 'support',
    Poppy: 'top',
    Pyke: 'support',
    Qiyana: 'mid',
    Quinn: 'top',
    Rakan: 'support',
    Rammus: 'jungle',
    RekSai: 'jungle',
    Rell: 'support',
    Renata: 'support',
    Renekton: 'top',
    Rengar: 'jungle',
    Riven: 'top',
    Rumble: 'top',
    Ryze: 'mid',
    Samira: 'adc',
    Sejuani: 'jungle',
    Senna: 'support',
    Seraphine: 'support',
    Sett: 'top',
    Shaco: 'jungle',
    Shen: 'top',
    Shyvana: 'jungle',
    Singed: 'top',
    Sion: 'top',
    Sivir: 'adc',
    Skarner: 'jungle',
    Smolder: 'adc',
    Sona: 'support',
    Soraka: 'support',
    Swain: 'support',
    Sylas: 'mid',
    Syndra: 'mid',
    TahmKench: 'support',
    Taliyah: 'jungle',
    Talon: 'mid',
    Taric: 'support',
    Teemo: 'top',
    Thresh: 'support',
    Tristana: 'adc',
    Trundle: 'jungle',
    Tryndamere: 'top',
    TwistedFate: 'mid',
    Twitch: 'adc',
    Udyr: 'jungle',
    Urgot: 'top',
    Varus: 'adc',
    Vayne: 'adc',
    Veigar: 'mid',
    Velkoz: 'support',
    Vex: 'mid',
    Vi: 'jungle',
    Viego: 'jungle',
    Viktor: 'mid',
    Vladimir: 'mid',
    Volibear: 'top',
    Warwick: 'jungle',
    Xayah: 'adc',
    Xerath: 'support',
    XinZhao: 'jungle',
    Yasuo: 'mid',
    Yone: 'mid',
    Yorick: 'top',
    Yuumi: 'support',
    Zac: 'jungle',
    Zed: 'mid',
    Zeri: 'adc',
    Ziggs: 'mid',
    Zilean: 'support',
    Zoe: 'mid',
    Zyra: 'support',
  };

  window.Lolphabet.Positions = {
    POSITIONS,
    POSITION_ORDER,
    POSITION_LABELS,
    /**
     * Renvoie le poste d'un champion (ou "other" si inconnu).
     */
    get(championId) {
      return POSITIONS[championId] || 'other';
    },
  };
})();

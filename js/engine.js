/* ============================================================
   Crónicas del Umbral — motor: núcleo (sin DOM)
   ============================================================ */
(function () {
  "use strict";
  const RPG = (globalThis.RPG = globalThis.RPG || {});
  const D = RPG.data;
  const E = (RPG.engine = {});
  const H = (E._ = {});
  const SAVE_KEY = "cronicas_umbral_save_v1";
  const META_KEY = "cronicas_umbral_meta_v1";
  const VERSION = 1;

  /* ---------------- utilidades ---------------- */
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  H.clamp = clamp;
  H.uid = uid;

  E.XP_TABLE = [0, 0, 40, 100, 180, 290, 430, 600, 800, 1030, 1290, 1580, 1900, 2250, 2630, 3040, 3480, 3960, 4480, 5020, 5600, 6220];
  E.MAX_LEVEL = E.XP_TABLE.length - 1;

  E.NODE_TYPES = {
    combat:   { name: "Combate",   icon: "⚔️", desc: "Criaturas te bloquean el paso." },
    elite:    { name: "Élite",     icon: "💀", desc: "Un enemigo poderoso. Mejores recompensas." },
    event:    { name: "Evento",    icon: "❓", desc: "Un encuentro inesperado." },
    rest:     { name: "Descanso",  icon: "🔥", desc: "Recupera fuerzas junto al fuego." },
    shop:     { name: "Mercader",  icon: "🏪", desc: "Compra equipo, pociones y reliquias." },
    treasure: { name: "Tesoro",    icon: "💎", desc: "Un cofre olvidado con botín." },
    shrine:   { name: "Santuario", icon: "⛩️", desc: "Recibe una bendición de los antiguos." },
    boss:     { name: "Jefe Final",icon: "👑", desc: "El enfrentamiento decisivo." }
  };

  /* ---------------- RNG determinista ---------------- */
  function makeRng(seed) {
    let s = seed >>> 0;
    function next() {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next,
      int(a, b) { return a + Math.floor(next() * (b - a + 1)); },
      pick(arr) { return arr[Math.floor(next() * arr.length)]; },
      chance(p) { return next() < p; },
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      },
      weighted(arr, wfn) {
        const ws = arr.map((x, i) => Math.max(0, wfn ? wfn(x, i) : 1));
        const total = ws.reduce((a, b) => a + b, 0);
        if (total <= 0) return arr[0];
        let r = next() * total;
        for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
        return arr[arr.length - 1];
      },
      getState() { return s >>> 0; },
      setState(v) { s = v >>> 0; }
    };
  }
  let rng = null;
  H.getRng = function (g) {
    if (!rng) {
      rng = makeRng((g && g.seed) || Date.now());
      if (g && typeof g.rngState === "number") rng.setState(g.rngState);
    }
    return rng;
  };
  H.syncRng = function (g) { if (rng && g) g.rngState = rng.getState(); };

  /* ---------------- meta / guardado ---------------- */
  const DEFAULT_META = { runs: 0, victories: 0, bestScore: 0, kills: 0, totalGold: 0 };
  E.getMeta = function () {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (!raw) return Object.assign({}, DEFAULT_META);
      return Object.assign({}, DEFAULT_META, JSON.parse(raw));
    } catch (e) { return Object.assign({}, DEFAULT_META); }
  };
  E.saveMeta = function (meta) {
    try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
  };
  E.save = function (g) {
    if (!g) return;
    try {
      H.syncRng(g);
      g.version = VERSION;
      g.savedAt = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(g));
    } catch (e) {}
  };
  E.hasSave = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const g = JSON.parse(raw);
      return !!(g && g.player && !g.finished);
    } catch (e) { return false; }
  };
  E.loadSave = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const g = JSON.parse(raw);
      if (!g || !g.player || g.finished) return null;
      rng = makeRng(g.seed || Date.now());
      rng.setState(g.rngState || 1);
      RPG.game = g;
      return g;
    } catch (e) { return null; }
  };
  E.clearSave = function () {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  };

  /* ---------------- estadísticas del jugador ---------------- */
  const MULT_KEYS = {
    goldMult: 1, xpMult: 1, healMult: 1, dmgMult: 1, dmgTakenMult: 1,
    skillCostMult: 1, shopMult: 1, maxHpMult: 1, resMaxMult: 1
  };
  function addStats(s, stats) {
    if (!stats) return;
    for (const k in stats) {
      const v = stats[k];
      if (k === "noRevives") { s.noRevives = true; continue; }
      if (k in MULT_KEYS) { s[k] *= v; continue; }
      if (typeof s[k] === "number") s[k] += v;
      else s[k] = v;
    }
  }
  H.addStats = addStats;

  function applyMods(s, mods) {
    if (!mods) return;
    for (const k in mods) {
      const v = mods[k];
      if (k === "enemyAtk" || k === "enemyAtkMult") { s.enemyAtkMult *= v; continue; }
      if (k === "startGold") { s.startGold = v; continue; }
      if (k === "noRevives") { s.noRevives = true; continue; }
      if (k === "healMult" || k === "dmgMult") { s[k] *= 1 + v; continue; }
      if (k in MULT_KEYS) { s[k] *= v; continue; }
      if (typeof s[k] === "number") s[k] += v;
      else s[k] = v;
    }
  }
  H.applyMods = applyMods;

  E.stats = function (g) {
    const p = g.player;
    const cls = D.byId.classes[p.classId] || D.classes[0];
    const s = {
      maxHp: cls.hp + (p.level - 1) * 6,
      atk: cls.atk + (p.level - 1),
      def: cls.def + Math.floor((p.level - 1) / 2),
      crit: cls.crit, critDmg: cls.critDmg,
      resMax: cls.res.max, resRegen: cls.res.regen, resStart: cls.res.start,
      lifesteal: 0, thorns: 0, healAfterCombat: 0, firstDodge: 0, firstStrike: 0,
      dmgSingle: 0, execute: 0, lowHpDmg: 0, debuffDmg: 0, skillDmg: 0,
      regenPerTurn: 0, bonusPotions: 0, revive: 0, startShield: 0, ambush: 0,
      enemyAtkMult: 1, startPoison: 0, startGold: 45, restHealMult: 1,
      noRevives: false, bonusPerk: 0,
      goldMult: 1, xpMult: 1, healMult: 1, dmgMult: 1, dmgTakenMult: 1,
      skillCostMult: 1, shopMult: 1, maxHpMult: 1, resMaxMult: 1
    };
    if (cls.passive) applyMods(s, { [cls.passive.key]: cls.passive.value });
    if (p.bonus) addStats(s, p.bonus);
    for (const slot of ["weapon", "armor", "trinket"]) {
      const it = p.equipment && p.equipment[slot];
      if (it) addStats(s, it.stats);
    }
    for (const id of p.relicIds || []) { const r = D.byId.relics[id]; if (r) addStats(s, r.stats); }
    for (const id of p.perkIds || []) { const pk = D.byId.perks[id]; if (pk) addStats(s, pk.stats); }
    const comp = D.byId.companions[g.build.companionId];
    if (comp && comp.mods) applyMods(s, comp.mods);
    const patron = D.byId.patrons[g.build.patronId];
    if (patron && patron.mods) applyMods(s, patron.mods);
    const scen = D.byId.scenarios[g.build.scenarioId];
    if (scen && scen.mods) applyMods(s, scen.mods);
    for (const id of g.build.curseIds || []) {
      const cur = D.byId.curses[id];
      if (cur && cur.mods) applyMods(s, cur.mods);
    }
    const diff = D.byId.difficulties[g.build.difficultyId];
    const len = D.byId.lengths[g.build.lengthId];
    if (diff) { s.goldMult *= diff.goldMult; s.xpMult *= diff.xpMult; s.revive += diff.reviveBonus; }
    if (len) s.xpMult *= len.xpMult;
    s.maxHp = Math.max(1, Math.round(s.maxHp * s.maxHpMult));
    s.resMax = Math.max(20, Math.round(s.resMax * s.resMaxMult));
    s.crit = clamp(s.crit, 0, 0.85);
    s.critDmg = Math.max(1.2, s.critDmg);
    s.dmgTakenMult = clamp(s.dmgTakenMult, 0.3, 3);
    s.skillCostMult = clamp(s.skillCostMult, 0.3, 3);
    if (s.noRevives) s.revive = 0;
    return s;
  };

  E.syncHp = function (g, healDelta) {
    const s = E.stats(g);
    if (healDelta) g.player.hp += healDelta;
    g.player.hp = clamp(g.player.hp, 1, s.maxHp);
    g.player.energy = clamp(g.player.energy || 0, 0, s.resMax);
    return s;
  };

  E.goldGain = function (g, base) {
    return Math.max(0, Math.round(base * E.stats(g).goldMult));
  };
  E.gainGold = function (g, base, applyMult) {
    const amount = applyMult === false ? Math.max(0, Math.round(base)) : E.goldGain(g, base);
    g.player.gold += amount;
    return amount;
  };
  E.healPlayer = function (g, amount) {
    const s = E.stats(g);
    const real = Math.max(0, Math.round(amount * s.healMult));
    const before = g.player.hp;
    g.player.hp = Math.min(s.maxHp, g.player.hp + real);
    return g.player.hp - before;
  };
  E.hurtPlayer = function (g, amount) {
    const dmg = Math.max(0, Math.round(amount));
    g.player.hp = Math.max(1, g.player.hp - dmg);
    return dmg;
  };
  E.xpToNext = function (level) {
    if (level >= E.MAX_LEVEL) return 0;
    return E.XP_TABLE[level + 1] - E.XP_TABLE[level];
  };
  E.xpProgress = function (g) {
    const lvl = g.player.level;
    const cur = E.XP_TABLE[lvl] || 0;
    const next = E.XP_TABLE[lvl + 1] || cur;
    const into = clamp(g.player.xp - cur, 0, Math.max(1, next - cur));
    return { into, need: Math.max(1, next - cur), pct: clamp(into / Math.max(1, next - cur), 0, 1) };
  };
  E.awardXP = function (g, amount) {
    const gain = Math.max(0, Math.round(amount * E.stats(g).xpMult));
    g.player.xp += gain;
    let levels = 0;
    while (g.player.level < E.MAX_LEVEL && g.player.xp >= (E.XP_TABLE[g.player.level + 1] || Infinity)) {
      g.player.level++;
      levels++;
    }
    if (levels > 0) {
      const s = E.stats(g);
      g.player.hp = Math.min(s.maxHp, g.player.hp + Math.round(s.maxHp * 0.15) + (levels - 1) * 3);
      g.player.energy = s.resMax;
      g.pendingLevels = (g.pendingLevels || 0) + levels;
    }
    return { gain, levels };
  };

  /* ---------------- objetos ---------------- */
  function makeItem(tpl) {
    return { uid: uid(), id: tpl.id, name: tpl.name, icon: tpl.icon, slot: tpl.slot, rarity: tpl.rarity, stats: Object.assign({}, tpl.stats), desc: tpl.desc };
  }
  E.makeItem = makeItem;

  E.addItem = function (g, tpl) {
    const item = tpl.uid ? tpl : makeItem(tpl);
    const slot = item.slot;
    if (g.player.equipment && !g.player.equipment[slot]) {
      g.player.equipment[slot] = item;
      E.syncHp(g);
      return { item, equipped: true };
    }
    g.player.items.push(item);
    return { item, equipped: false };
  };

  E.rollRarity = function (g, tier, stage) {
    const r = H.getRng(g).next();
    if (tier === "elite") {
      if (r < 0.5) return "raro";
      if (r < 0.88) return "epico";
      return "legendario";
    }
    if (tier === "treasure") {
      if (r < 0.3) return "raro";
      if (r < 0.82) return "epico";
      return "legendario";
    }
    if (r < 0.55) return "comun";
    if (r < 0.9) return "raro";
    if (r < 0.985 || stage < 5) return "epico";
    return "legendario";
  };

  E.randomItem = function (g, rarity, exclude) {
    const ex = exclude || [];
    const r = H.getRng(g);
    let pool = D.items.filter(i => i.rarity === rarity && !ex.includes(i.id));
    if (pool.length === 0) pool = D.items.filter(i => !ex.includes(i.id));
    if (pool.length === 0) pool = D.items.slice();
    return makeItem(r.pick(pool));
  };

  E.equipItem = function (g, itemUid) {
    const p = g.player;
    const idx = p.items.findIndex(it => it.uid === itemUid);
    if (idx < 0) return false;
    const item = p.items[idx];
    p.items.splice(idx, 1);
    const prev = p.equipment[item.slot];
    p.equipment[item.slot] = item;
    if (prev) p.items.push(prev);
    E.syncHp(g);
    return true;
  };
  E.unequipItem = function (g, slot) {
    const p = g.player;
    const item = p.equipment[slot];
    if (!item) return false;
    p.equipment[slot] = null;
    p.items.push(item);
    E.syncHp(g);
    return true;
  };
  E.potionCount = function (g, id) { return (g.player.potions && g.player.potions[id]) || 0; };
  E.addPotion = function (g, id, n) {
    g.player.potions[id] = (g.player.potions[id] || 0) + (n || 1);
  };
  E.removePotion = function (g, id, n) {
    const have = E.potionCount(g, id);
    if (have < (n || 1)) return false;
    g.player.potions[id] = have - (n || 1);
    if (g.player.potions[id] <= 0) delete g.player.potions[id];
    return true;
  };

  /* ---------------- generación del mapa ---------------- */
  function nodeId(stage, type, i) { return "n" + stage + "_" + type + "_" + i; }

  function generateMap(g) {
    const len = D.byId.lengths[g.build.lengthId] || D.lengths[1];
    const total = len.stages;
    const r = H.getRng(g);
    const stages = [];
    const last = total - 1;
    const restAt = total - 3;
    const shopAt = Math.max(1, Math.floor(total / 2));
    const eliteAt = Math.max(1, Math.floor(total * 0.62));
    for (let i = 0; i < total; i++) {
      if (i === last) {
        stages.push({ index: i, options: [{ id: nodeId(i, "boss", 0), type: "boss", stage: i }] });
        continue;
      }
      const forced = [];
      if (i === 0) forced.push("combat");
      if (i === restAt && restAt > 2 && restAt < last) forced.push("rest");
      if (i === shopAt && shopAt < last) forced.push("shop");
      if (i === eliteAt && eliteAt < last && !forced.includes("combat")) forced.push("elite");
      const weights = {
        combat: 38 + (i < 3 ? 12 : 0),
        event: 18,
        treasure: 10,
        elite: i >= 2 ? 6 + i * 1.4 : 0,
        rest: 5,
        shop: 5,
        shrine: 6
      };
      const types = [];
      for (const t of forced) if (!types.includes(t)) types.push(t);
      const target = i === 0 ? 3 : (r.chance(0.55) ? 3 : 2);
      let guard = 0;
      while (types.length < target && guard++ < 40) {
        const avail = Object.keys(weights).filter(t => !types.includes(t) && weights[t] > 0);
        if (!avail.length) break;
        const t = r.weighted(avail, x => weights[x]);
        types.push(t);
      }
      const options = r.shuffle(types).map((t, k) => ({ id: nodeId(i, t, k), type: t, stage: i }));
      stages.push({ index: i, options });
    }
    return stages;
  }
  E.generateMap = generateMap;

  /* ---------------- creación de partida ---------------- */
  const NAMES = ["Aldric", "Brynn", "Kael", "Lyra", "Dorian", "Sera", "Torvald", "Mireia", "Rook", "Isolde", "Fenris", "Ariel", "Cassian", "Nyx", "Orin", "Vesper", "Thane", "Elara", "Soren", "Maeve"];
  E.randomName = function () { return H.getRng(RPG.game || { seed: Date.now() }).pick(NAMES); };

  E.normalizeBuild = function (build) {
    const b = Object.assign({}, build || {});
    const pick = (list, id, fallback) => (D.byId[list][id] ? id : D[list][fallback || 0].id);
    b.classId = pick("classes", b.classId, 0);
    b.scenarioId = pick("scenarios", b.scenarioId, 0);
    b.themeId = pick("themes", b.themeId, 5);
    b.difficultyId = pick("difficulties", b.difficultyId, 1);
    b.lengthId = pick("lengths", b.lengthId, 1);
    b.companionId = pick("companions", b.companionId, 0);
    b.patronId = pick("patrons", b.patronId, 0);
    if (!D.byId.relics[b.relicId]) b.relicId = H.getRng(RPG.game || { seed: Date.now() }).pick(D.relics).id;
    b.curseIds = (b.curseIds || []).filter(id => D.byId.curses[id]).slice(0, 2);
    return b;
  };

  E.randomBuild = function (g) {
    const r = H.getRng(g || { seed: Date.now() });
    const curses = [];
    if (r.chance(0.35)) {
      const pool = r.shuffle(D.curses);
      curses.push(pool[0].id);
      if (r.chance(0.3)) curses.push(pool[1].id);
    }
    return E.normalizeBuild({
      classId: r.pick(D.classes).id,
      scenarioId: r.pick(D.scenarios).id,
      themeId: r.pick(D.themes).id,
      difficultyId: r.weighted(D.difficulties, x => x.id === "peregrino" ? 0.6 : x.id === "leyenda" ? 0.7 : 1.4).id,
      lengthId: r.weighted(D.lengths, x => x.id === "aventura" ? 1.6 : 1).id,
      companionId: r.pick(D.companions).id,
      patronId: r.pick(D.patrons).id,
      relicId: r.pick(D.relics).id,
      curseIds: curses
    });
  };

  E.newGame = function (build, name, mode) {
    rng = makeRng((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    const b = E.normalizeBuild(build);
    const cls = D.byId.classes[b.classId];
    const g = {
      version: VERSION,
      seed: rng.getState(),
      rngState: rng.getState(),
      createdAt: Date.now(),
      mode: mode || "custom",
      build: b,
      screen: "map",
      stageIndex: 0,
      currentNode: null,
      pending: null,
      pendingLevels: 0,
      seenEvents: [],
      finished: false,
      victory: false,
      player: {
        name: (name || "Aventurero").trim().slice(0, 24) || "Aventurero",
        classId: b.classId,
        level: 1,
        xp: 0,
        hp: 1,
        energy: cls.res.start,
        gold: 0,
        potions: {},
        items: [],
        equipment: { weapon: null, armor: null, trinket: null },
        relicIds: [],
        perkIds: [],
        revivesUsed: 0,
        bonus: { atk: 0, def: 0, maxHp: 0 }
      },
      stats: { kills: 0, nodes: 0, damageDealt: 0, damageTaken: 0, potionsUsed: 0, fled: 0, goldEarned: 0 },
      log: []
    };
    RPG.game = g;

    // reliquia inicial
    if (b.relicId) g.player.relicIds.push(b.relicId);
    // recompensas de maldiciones
    let bonusPerks = 0;
    let bonusGold = 0;
    for (const id of b.curseIds) {
      const c = D.byId.curses[id];
      if (!c) continue;
      if (c.reward.type === "relic") {
        const pool = D.relics.filter(x => !g.player.relicIds.includes(x.id));
        if (pool.length) g.player.relicIds.push(rng.pick(pool).id);
      } else if (c.reward.type === "perk") {
        bonusPerks++;
      } else if (c.reward.type === "item") {
        const it = E.randomItem(g, c.reward.rarity || "rare");
        E.addItem(g, it);
      } else if (c.reward.type === "gold") {
        bonusGold += c.reward.value || 0;
      }
    }
    // oro y pociones iniciales
    let baseGold = 45;
    for (const id of b.curseIds) {
      const c = D.byId.curses[id];
      if (c && c.mods && typeof c.mods.startGold === "number") baseGold = c.mods.startGold;
    }
    g.player.gold = Math.max(0, baseGold + bonusGold);
    const s0 = E.stats(g);
    const extraPotions = s0.bonusPotions || 0;
    g.player.potions.vida = 2 + extraPotions;
    if (["mago", "clerigo", "druida"].includes(b.classId)) g.player.potions.mana = 1;
    g.player.hp = s0.maxHp;
    g.player.energy = s0.resMax;
    // mejora extra del patrón y maldiciones
    const patron = D.byId.patrons[b.patronId];
    bonusPerks += patron && patron.bonusPerk ? patron.bonusPerk : 0;
    // mapa
    g.map = generateMap(g);
    // registro inicial
    const scen = D.byId.scenarios[b.scenarioId];
    g.log.push({ text: scen ? scen.greeting : "Tu viaje comienza.", cls: "sys" });
    g.log.push({ text: `Comienza la expedición de ${g.player.name}, ${cls.name}.`, cls: "sys" });

    if (bonusPerks > 0) {
      g.pending = { type: "perk", remaining: bonusPerks, choices: E.perkChoices(g, 3), advance: false, title: "Don inicial", context: "start" };
      g.screen = "perk";
    }
    E.save(g);
    return g;
  };

  /* ---------------- mejoras ---------------- */
  E.perkChoices = function (g, n) {
    const owned = g.player.perkIds || [];
    let pool = D.perks.filter(p => !owned.includes(p.id));
    if (pool.length < n) pool = D.perks.slice();
    return H.getRng(g).shuffle(pool).slice(0, n);
  };

  E.resolveLevelsOr = function (g, advance) {
    if ((g.pendingLevels || 0) > 0) {
      const n = g.pendingLevels;
      g.pendingLevels = 0;
      g.pending = { type: "perk", remaining: n, choices: E.perkChoices(g, 3), advance: !!advance, title: "Subida de nivel", context: "level" };
      g.screen = "perk";
      E.save(g);
      return;
    }
    if (advance) E.finishNode(g);
    else {
      g.pending = null;
      g.screen = "map";
      E.save(g);
    }
  };

  E.choosePerk = function (g, perkId) {
    if (!g.pending || g.pending.type !== "perk") return false;
    const perk = D.byId.perks[perkId];
    if (!perk || !g.pending.choices.some(p => p.id === perkId)) return false;
    const p = g.player;
    p.perkIds.push(perk.id);
    if (perk.stats && perk.stats.maxHp) p.hp += perk.stats.maxHp;
    E.syncHp(g);
    g.pending.remaining--;
    if (g.pending.remaining > 0) {
      g.pending.choices = E.perkChoices(g, 3);
    } else {
      const advance = !!g.pending.advance;
      g.pending = null;
      if (advance) E.finishNode(g);
      else { g.screen = "map"; }
    }
    E.save(g);
    return true;
  };

  /* ---------------- nodos ---------------- */
  E.currentStage = function (g) { return g.map[g.stageIndex] || null; };

  E.startNode = function (g, nodeId) {
    if (g.pending || g.screen === "combat") return false;
    const stage = g.map[g.stageIndex];
    if (!stage) return false;
    const node = stage.options.find(o => o.id === nodeId);
    if (!node) return false;
    g.currentNode = node;
    const r = H.getRng(g);

    if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
      E.startCombat(g, node.type === "combat" ? "normal" : node.type);
      return true;
    }

    if (node.type === "event") {
      const scen = g.build.scenarioId;
      let pool = D.events.filter(ev => !ev.scenarios || ev.scenarios.includes(scen));
      const seen = g.seenEvents || [];
      const fresh = pool.filter(ev => !seen.includes(ev.id));
      if (fresh.length >= 2) pool = fresh;
      const ev = r.pick(pool);
      g.seenEvents = seen.concat([ev.id]);
      g.pending = { type: "event", eventId: ev.id };
      g.screen = "event";
      E.save(g);
      return true;
    }

    if (node.type === "rest") {
      g.pending = { type: "rest" };
      g.screen = "rest";
      E.save(g);
      return true;
    }

    if (node.type === "shop") {
      g.pending = { type: "shop", stock: E.makeShopStock(g) };
      g.screen = "shop";
      E.save(g);
      return true;
    }

    if (node.type === "treasure") {
      const stageNo = g.stageIndex + 1;
      const items = [];
      const used = [];
      for (let i = 0; i < 3; i++) {
        const it = E.randomItem(g, E.rollRarity(g, "treasure", stageNo), used);
        used.push(it.id);
        items.push(it);
      }
      g.pending = { type: "treasure", items, gold: E.goldGain(g, 15 + stageNo * 5) };
      g.screen = "treasure";
      E.save(g);
      return true;
    }

    if (node.type === "shrine") {
      g.pending = { type: "shrine", options: E.makeShrine(g) };
      g.screen = "shrine";
      E.save(g);
      return true;
    }
    return false;
  };

  E.finishNode = function (g) {
    g.stageIndex++;
    g.stats.nodes++;
    g.currentNode = null;
    g.pending = null;
    g.combat = null;
    const s = E.stats(g);
    g.player.energy = s.resMax;
    if (g.stageIndex >= g.map.length) {
      E.finishRun(g, true);
      return;
    }
    g.screen = "map";
    E.save(g);
  };

  E.dismissPending = function (g) {
    if (!g.pending) return;
    const p = g.pending;
    if (p.type === "eventResult") {
      g.pending = null;
      E.resolveLevelsOr(g, p.advance !== false);
    } else if (p.type === "shop") {
      E.finishNode(g);
    }
  };

  /* ---------------- recompensas de combate ---------------- */
  E.rewardScreen = function (g, c) {
    const stageNo = g.stageIndex + 1;
    let goldBase = 0, xpBase = 0;
    for (const e of c.enemies) {
      goldBase += (e.baseGold || 6) * (1 + (stageNo - 1) * 0.05);
      xpBase += (e.baseXp || 10) * (1 + (stageNo - 1) * 0.07);
    }
    if (c.tier === "elite") { goldBase *= 1.45; xpBase *= 1.3; }
    const bonus = c.bonus || {};
    goldBase += bonus.gold || 0;
    const gold = E.goldGain(g, goldBase);
    const items = [];
    const used = [];
    const count = c.tier === "elite" ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const it = E.randomItem(g, E.rollRarity(g, c.tier, stageNo), used);
      used.push(it.id);
      items.push(it);
    }
    let healed = 0;
    const s = E.stats(g);
    if (s.healAfterCombat) healed += E.healPlayer(g, s.maxHp * s.healAfterCombat);
    g.pending = {
      type: "rewards", gold, xp: Math.round(xpBase * 1.15), items,
      bonusRelic: !!bonus.relic, healed, tier: c.tier,
      potion: (c.tier === "elite" || H.getRng(g).chance(0.4)) ? "vida" : null
    };
    g.combat = null;
    g.screen = "rewards";
    E.save(g);
  };

  E.claimRewards = function (g, itemIndex) {
    if (!g.pending || g.pending.type !== "rewards") return;
    const p = g.pending;
    if (itemIndex != null && itemIndex >= 0 && p.items[itemIndex]) {
      E.addItem(g, p.items[itemIndex]);
    }
    g.player.gold += p.gold;
    g.stats.goldEarned += p.gold;
    if (p.potion) E.addPotion(g, p.potion, 1);
    E.awardXP(g, p.xp);
    if (p.bonusRelic) {
      const owned = g.player.relicIds || [];
      const pool = D.relics.filter(r => !owned.includes(r.id));
      if (pool.length) {
        const rel = H.getRng(g).pick(pool);
        g.player.relicIds.push(rel.id);
        g.log.push({ text: `Obtienes la reliquia ${rel.name}.`, cls: "good" });
      } else {
        const bonus = E.gainGold(g, 80);
        g.log.push({ text: `No quedan reliquias; recibes ${bonus} de oro.`, cls: "good" });
      }
    }
    g.pending = null;
    E.resolveLevelsOr(g, true);
    E.save(g);
  };

  /* ---------------- descanso ---------------- */
  E.restChoice = function (g, choice) {
    if (!g.pending || g.pending.type !== "rest") return false;
    const s = E.stats(g);
    if (choice === "sleep") {
      const healed = E.healPlayer(g, s.maxHp * 0.35 * s.restHealMult);
      g.pending = { type: "eventResult", title: "Descanso", icon: "🔥", lines: [{ icon: "💚", text: `Recuperas ${healed} de vida.` }], advance: true };
      g.screen = "eventResult";
    } else if (choice === "potions") {
      E.addPotion(g, "vida", 2);
      const rand = H.getRng(g).pick(D.potions).id;
      E.addPotion(g, rand, 1);
      g.pending = { type: "eventResult", title: "Alquimia", icon: "⚗️", lines: [{ icon: "🧪", text: "Preparas 2 pociones de vida y 1 poción aleatoria." }], advance: true };
      g.screen = "eventResult";
    } else if (choice === "train") {
      g.player.bonus.atk += 2;
      E.syncHp(g);
      g.pending = { type: "eventResult", title: "Entrenamiento", icon: "🏋️", lines: [{ icon: "💪", text: "+2 de ataque permanente." }], advance: true };
      g.screen = "eventResult";
    } else if (choice === "fortify") {
      g.player.bonus.def += 2;
      E.syncHp(g);
      g.pending = { type: "eventResult", title: "Fortificación", icon: "🛡️", lines: [{ icon: "🧱", text: "+2 de defensa permanente." }], advance: true };
      g.screen = "eventResult";
    } else return false;
    E.save(g);
    return true;
  };

  /* ---------------- tienda ---------------- */
  E.makeShopStock = function (g) {
    const r = H.getRng(g);
    const stageNo = g.stageIndex + 1;
    const stock = [];
    const used = [];
    for (let i = 0; i < 4; i++) {
      let rarity;
      const roll = r.next();
      if (stageNo <= 2) rarity = roll < 0.6 ? "comun" : roll < 0.95 ? "raro" : "epico";
      else if (stageNo <= 6) rarity = roll < 0.25 ? "comun" : roll < 0.72 ? "raro" : roll < 0.97 ? "epico" : "legendario";
      else rarity = roll < 0.1 ? "comun" : roll < 0.5 ? "raro" : roll < 0.88 ? "epico" : "legendario";
      const it = E.randomItem(g, rarity, used);
      used.push(it.id);
      const base = { comun: 30, raro: 55, epico: 90, legendario: 150 }[it.rarity] || 50;
      stock.push({ kind: "item", item: it, price: Math.round(base * E.stats(g).shopMult), sold: false });
    }
    const potionPool = r.shuffle(D.potions).slice(0, 3);
    for (const po of potionPool) {
      stock.push({ kind: "potion", potionId: po.id, price: Math.round(po.price * E.stats(g).shopMult), sold: false });
    }
    const owned = g.player.relicIds || [];
    const relicPool = D.relics.filter(x => !owned.includes(x.id));
    if (relicPool.length) {
      const rel = r.pick(relicPool);
      stock.push({ kind: "relic", relicId: rel.id, price: Math.round(90 * E.stats(g).shopMult), sold: false });
    }
    return stock;
  };

  E.shopBuy = function (g, index) {
    if (!g.pending || g.pending.type !== "shop") return false;
    const entry = g.pending.stock[index];
    if (!entry || entry.sold) return false;
    if (g.player.gold < entry.price) return false;
    g.player.gold -= entry.price;
    entry.sold = true;
    if (entry.kind === "item") E.addItem(g, entry.item);
    else if (entry.kind === "potion") E.addPotion(g, entry.potionId, 1);
    else if (entry.kind === "relic") {
      if (!g.player.relicIds.includes(entry.relicId)) g.player.relicIds.push(entry.relicId);
    }
    E.syncHp(g);
    E.save(g);
    return true;
  };

  E.shopLeave = function (g) {
    if (!g.pending || g.pending.type !== "shop") return;
    E.finishNode(g);
  };

  /* ---------------- tesoro / santuario ---------------- */
  E.treasureTake = function (g, idx) {
    if (!g.pending || g.pending.type !== "treasure") return;
    const p = g.pending;
    if (idx != null && idx >= 0 && p.items[idx]) E.addItem(g, p.items[idx]);
    g.player.gold += p.gold;
    g.stats.goldEarned += p.gold;
    E.syncHp(g);
    E.finishNode(g);
  };
  E.treasureSkip = function (g) {
    if (!g.pending || g.pending.type !== "treasure") return;
    g.player.gold += g.pending.gold;
    g.stats.goldEarned += g.pending.gold;
    E.finishNode(g);
  };

  E.makeShrine = function (g) {
    const r = H.getRng(g);
    const opts = [];
    const owned = g.player.relicIds || [];
    const relicPool = D.relics.filter(x => !owned.includes(x.id));
    if (relicPool.length) {
      const rel = r.pick(relicPool);
      opts.push({ id: "relic", kind: "relic", name: `Reliquia: ${rel.name}`, icon: rel.icon, desc: rel.desc, relicId: rel.id });
    }
    opts.push({ id: "atk", kind: "atk", name: "Filo Bendito", icon: "⚔️", desc: "+2 de ataque permanente." });
    opts.push({ id: "def", kind: "def", name: "Piel de Piedra", icon: "🛡️", desc: "+3 de defensa permanente." });
    opts.push({ id: "hp", kind: "hp", name: "Aliento de Vida", icon: "❤️", desc: "+15 de vida máxima." });
    opts.push({ id: "heal", kind: "heal", name: "Gracia Restauradora", icon: "💚", desc: "Recupera toda tu vida." });
    if ((g.build.curseIds || []).length) {
      opts.push({ id: "uncurse", kind: "uncurse", name: "Purificación", icon: "🔆", desc: "Elimina una maldición de tu partida." });
    }
    return r.shuffle(opts).slice(0, 3);
  };

  E.shrineChoose = function (g, idx) {
    if (!g.pending || g.pending.type !== "shrine") return;
    const opt = g.pending.options[idx];
    if (!opt) return;
    if (opt.kind === "relic") {
      if (!g.player.relicIds.includes(opt.relicId)) g.player.relicIds.push(opt.relicId);
    } else if (opt.kind === "atk") g.player.bonus.atk += 2;
    else if (opt.kind === "def") g.player.bonus.def += 3;
    else if (opt.kind === "hp") { g.player.bonus.maxHp += 15; g.player.hp += 15; }
    else if (opt.kind === "heal") { const s = E.stats(g); g.player.hp = s.maxHp; }
    else if (opt.kind === "uncurse") {
      g.build.curseIds = (g.build.curseIds || []).slice(1);
    }
    E.syncHp(g);
    E.finishNode(g);
  };

  /* ---------------- eventos ---------------- */
  E.getPendingEvent = function (g) {
    if (!g.pending || g.pending.type !== "event") return null;
    return D.byId.events[g.pending.eventId] || null;
  };

  E.applyEffects = function (g, effects, lines) {
    const r = H.getRng(g);
    let combatStarted = false;
    for (const ef of effects || []) {
      if (!ef) continue;
      if (ef.chance != null && !r.chance(ef.chance)) continue;
      switch (ef.t) {
        case "random": {
          const outcome = r.pick(ef.outcomes || [[]]);
          const sub = E.applyEffects(g, outcome, lines);
          if (sub.combatStarted) combatStarted = true;
          break;
        }
        case "gold": {
          const v = ef.v || 0;
          if (v >= 0) {
            const gained = E.gainGold(g, v);
            g.stats.goldEarned += gained;
            lines.push({ icon: "🪙", text: `Ganas ${gained} de oro.`, cls: "good" });
          } else {
            const lost = Math.min(g.player.gold, -v);
            g.player.gold -= lost;
            lines.push({ icon: "🪙", text: `Pierdes ${lost} de oro.`, cls: "bad" });
          }
          break;
        }
        case "heal": {
          const amount = ef.flat != null ? ef.flat : ef.pct != null ? E.stats(g).maxHp * ef.pct : 0;
          const healed = E.healPlayer(g, amount);
          lines.push({ icon: "💚", text: `Recuperas ${healed} de vida.`, cls: "good" });
          break;
        }
        case "damage": {
          const amount = ef.flat != null ? ef.flat : ef.pct != null ? E.stats(g).maxHp * ef.pct : 0;
          const dealt = E.hurtPlayer(g, amount);
          lines.push({ icon: "💔", text: `Sufres ${dealt} de daño.`, cls: "bad" });
          break;
        }
        case "xp": {
          const res = E.awardXP(g, ef.v || 0);
          lines.push({ icon: "📜", text: `Ganas ${res.gain} de experiencia.`, cls: "good" });
          break;
        }
        case "maxHp": {
          const v = ef.v || 0;
          g.player.bonus.maxHp += v;
          g.player.hp += Math.max(0, v);
          E.syncHp(g);
          lines.push({ icon: "❤️", text: `+${v} de vida máxima.`, cls: "good" });
          break;
        }
        case "atk": {
          g.player.bonus.atk += ef.v || 0;
          lines.push({ icon: "⚔️", text: `+${ef.v} de ataque.`, cls: "good" });
          break;
        }
        case "def": {
          g.player.bonus.def += ef.v || 0;
          lines.push({ icon: "🛡️", text: `+${ef.v} de defensa.`, cls: "good" });
          break;
        }
        case "potion": {
          const id = ef.id || "vida";
          E.addPotion(g, id, ef.n || 1);
          const po = D.byId.potions[id];
          lines.push({ icon: po ? po.icon : "🧪", text: `Obtienes ${ef.n || 1} × ${po ? po.name : "poción"}.`, cls: "good" });
          break;
        }
        case "item": {
          const it = E.randomItem(g, ef.rarity || "raro");
          const res = E.addItem(g, it);
          lines.push({ icon: it.icon, text: `Obtienes ${it.name}${res.equipped ? " (equipado)" : " (en la bolsa)"}.`, cls: "good" });
          break;
        }
        case "relic": {
          const owned = g.player.relicIds || [];
          const pool = D.relics.filter(x => !owned.includes(x.id));
          if (pool.length) {
            const rel = r.pick(pool);
            g.player.relicIds.push(rel.id);
            lines.push({ icon: rel.icon, text: `Obtienes la reliquia ${rel.name}.`, cls: "good" });
          } else {
            const gained = E.gainGold(g, 70);
            lines.push({ icon: "🪙", text: `No quedan reliquias; recibes ${gained} de oro.`, cls: "good" });
          }
          break;
        }
        case "weaponUpgrade": {
          const w = g.player.equipment.weapon;
          if (w) {
            w.stats.atk = (w.stats.atk || 0) + (ef.v || 2);
            lines.push({ icon: w.icon, text: `${w.name} gana +${ef.v || 2} de ataque.`, cls: "good" });
          } else {
            g.player.bonus.atk += ef.v || 2;
            lines.push({ icon: "⚔️", text: `+${ef.v || 2} de ataque.`, cls: "good" });
          }
          break;
        }
        case "fullHeal": {
          const s = E.stats(g);
          g.player.hp = s.maxHp;
          lines.push({ icon: "✨", text: "Tu vida se restaura por completo.", cls: "good" });
          break;
        }
        case "cleanse": {
          lines.push({ icon: "💧", text: "Te purificas de toda aflicción.", cls: "good" });
          break;
        }
        case "combat": {
          combatStarted = true;
          E.startCombat(g, ef.tier || "normal", { bonus: ef.bonus || {} });
          break;
        }
        default: break;
      }
    }
    return { combatStarted };
  };

  E.eventChoose = function (g, idx) {
    if (!g.pending || g.pending.type !== "event") return;
    const ev = D.byId.events[g.pending.eventId];
    if (!ev) return;
    const ch = ev.choices[idx];
    if (!ch) return;
    if (ch.req && ch.req.gold && g.player.gold < ch.req.gold) return;
    const lines = [];
    const res = E.applyEffects(g, ch.effects, lines);
    g.log.push({ text: `${ev.name}: ${ch.label}.`, cls: "sys" });
    if (res.combatStarted) {
      E.save(g);
      return;
    }
    g.pending = { type: "eventResult", title: ev.name, icon: ev.icon, lines, advance: true };
    g.screen = "eventResult";
    E.save(g);
  };

  /* ---------------- final de partida ---------------- */
  E.score = function (g) {
    const diff = D.byId.difficulties[g.build.difficultyId] || { scoreMult: 1 };
    const base = (g.stats.nodes || 0) * 45 + (g.stats.kills || 0) * 30 + (g.player.level || 1) * 90 +
      Math.round((g.player.gold || 0) * 0.5) + (g.victory ? 900 : 0);
    return Math.round(base * (diff.scoreMult || 1));
  };

  E.finishRun = function (g, victory) {
    g.finished = true;
    g.victory = !!victory;
    if (victory && g.map) g.stats.nodes = Math.max(g.stats.nodes || 0, g.map.length);
    g.pending = null;
    g.combat = null;
    g.screen = victory ? "victory" : "defeat";
    g.score = E.score(g);
    const meta = E.getMeta();
    meta.runs += 1;
    if (victory) meta.victories += 1;
    meta.kills += g.stats.kills || 0;
    meta.totalGold += g.stats.goldEarned || 0;
    if (g.score > (meta.bestScore || 0)) meta.bestScore = g.score;
    E.saveMeta(meta);
    E.clearSave();
  };

  E.abandon = function (g) {
    g.abandoned = true;
    E.finishRun(g, false);
  };

  /* __CORE3__ */
})();

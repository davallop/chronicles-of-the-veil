/* ============================================================
   Crónicas del Umbral — interfaz: base, menú, creación, mapa
   ============================================================ */
(function () {
  "use strict";
  const RPG = (globalThis.RPG = globalThis.RPG || {});
  const D = RPG.data;
  const E = RPG.engine;
  const U = (RPG.ui = {});
  U.actions = {};
  U.modal = null;
  U.mode = "menu";
  U.creation = null;
  U.targeting = null;
  U.lastEvents = [];

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (n) => Math.round((n || 0) * 1000) / 10 + "%";
  U.esc = esc;
  U.pct = pct;

  const STAT_INFO = {
    maxHp: ["❤️", "Vida", "flat"], atk: ["⚔️", "Ataque", "flat"], def: ["🛡️", "Defensa", "flat"],
    crit: ["🎯", "Crítico", "pct"], critDmg: ["💥", "Daño crítico", "pct"], resMax: ["💠", "Recurso", "flat"],
    resRegen: ["🔋", "Regen. recurso", "flat"], lifesteal: ["🩸", "Robo de vida", "pct"], thorns: ["🌵", "Espinas", "flat"],
    revive: ["✨", "Resurrección", "flat"], healAfterCombat: ["🏕️", "Cura tras combate", "pct"],
    firstDodge: ["👢", "Esquiva inicial", "flat"], firstStrike: ["⚡", "Golpe inicial", "pct"],
    dmgSingle: ["🎯", "Daño a un enemigo", "pct"], execute: ["💀", "Ejecución", "pct"],
    lowHpDmg: ["🩸", "Daño con poca vida", "pct"], debuffDmg: ["🧪", "Daño a afligidos", "pct"],
    skillDmg: ["🪄", "Daño de habilidad", "pct"], regenPerTurn: ["💚", "Regen. por turno", "pct"],
    bonusPotions: ["🧪", "Pociones extra", "flat"], startShield: ["🛡️", "Escudo inicial", "flat"],
    ambush: ["🌫️", "Vida enemiga reducida", "pct"], startPoison: ["☠️", "Veneno inicial", "flat"],
    restHealMult: ["🔥", "Curación al descansar", "mult"], goldMult: ["🪙", "Oro", "mult"],
    xpMult: ["📜", "XP", "mult"], healMult: ["💚", "Curación", "mult"], dmgMult: ["⚔️", "Daño", "mult"],
    dmgTakenMult: ["🛡️", "Daño recibido", "mult"], skillCostMult: ["🪄", "Coste de habilidad", "mult"],
    shopMult: ["🏪", "Precios", "mult"], maxHpMult: ["❤️", "Vida", "mult"], resMaxMult: ["💠", "Recurso", "mult"]
  };
  const STAT_ORDER = Object.keys(STAT_INFO);

  U.statChips = function (stats) {
    if (!stats) return "";
    const out = [];
    for (const k of STAT_ORDER) {
      if (!(k in stats)) continue;
      const v = stats[k];
      if (typeof v !== "number" || !isFinite(v) || v === 0) continue;
      const [icon, label, kind] = STAT_INFO[k];
      let text;
      if (kind === "mult") {
        if (Math.abs(v - 1) < 0.0001) continue;
        text = `${label} ${v > 1 ? "+" : "−"}${Math.round(Math.abs(v - 1) * 100)}%`;
      } else if (kind === "pct") {
        text = `${label} ${v > 0 ? "+" : "−"}${Math.round(Math.abs(v) * 1000) / 10}%`;
      } else {
        text = `${label} ${v > 0 ? "+" : "−"}${Math.abs(Math.round(v * 10) / 10)}`;
      }
      const good = k === "dmgTakenMult" || k === "skillCostMult" || k === "shopMult" ? v < 1 : v > 0;
      out.push(`<span class="stat-${good ? "good" : "bad"}" title="${esc(label)}">${icon} ${esc(text)}</span>`);
    }
    return out.join("");
  };

  const RARITY = { comun: "Común", raro: "Raro", epico: "Épico", legendario: "Legendario" };
  U.RARITY = RARITY;
  U.rarityClass = (r) => "rarity-" + (r || "comun");
  U.slotName = (slot) => (D.itemSlots[slot] && D.itemSlots[slot].name) || slot;

  U.hpBar = function (hp, max, cls) {
    const p = Math.max(0, Math.min(1, max ? hp / max : 0));
    return `<div class="bar"><div class="bar-fill ${cls || "hp"}" style="width:${p * 100}%"></div></div>`;
  };
  U.resBar = function (value, max) {
    const p = Math.max(0, Math.min(1, max ? value / max : 0));
    return `<div class="bar"><div class="bar-fill res" style="width:${p * 100}%"></div></div>`;
  };
  U.statusChips = function (statuses) {
    if (!statuses || !statuses.length) return "";
    return statuses.map(s => {
      const info = D.statuses[s.id] || { name: s.id, icon: "•", kind: "debuff" };
      return `<span class="status-chip ${info.kind}" title="${esc(info.name)}">${info.icon} ${esc(info.name)}${s.value ? " " + s.value : ""}<span class="t">·${s.turns}</span></span>`;
    }).join("");
  };
  U.relicChips = function (ids) {
    if (!ids || !ids.length) return '<span class="tiny muted">Ninguna</span>';
    return ids.map(id => {
      const r = D.byId.relics[id];
      return r ? `<span class="relic-chip" title="${esc(r.desc)}">${r.icon} ${esc(r.name)}</span>` : "";
    }).join("");
  };

  /* ---------------- render principal ---------------- */
  U.render = function () {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = U.renderApp();
    window.scrollTo({ top: 0, behavior: "instant" });
    U.afterRender();
  };

  U.renderApp = function () {
    let content;
    if (U.mode === "creation") content = U.renderCreation();
    else if (U.mode === "menu" || !RPG.game) content = U.renderMenu();
    else content = U.renderGame();
    return `<div class="screen">${content}</div>${U.renderModal()}`;
  };

  U.renderGame = function () {
    const g = RPG.game;
    if (!g) return U.renderMenu();
    if (g.screen === "victory" || g.screen === "defeat") {
      return U.renderEnd ? U.renderEnd(g) : "";
    }
    let body = "";
    if (g.screen === "map") body = U.renderMap(g);
    else if (g.screen === "combat" && U.renderCombat) body = U.renderCombat(g);
    else if (g.screen === "rewards" && U.renderRewards) body = U.renderRewards(g);
    else if (g.screen === "perk" && U.renderPerk) body = U.renderPerk(g);
    else if (g.screen === "event" && U.renderEvent) body = U.renderEvent(g);
    else if (g.screen === "eventResult" && U.renderEventResult) body = U.renderEventResult(g);
    else if (g.screen === "shop" && U.renderShop) body = U.renderShop(g);
    else if (g.screen === "rest" && U.renderRest) body = U.renderRest(g);
    else if (g.screen === "treasure" && U.renderTreasure) body = U.renderTreasure(g);
    else if (g.screen === "shrine" && U.renderShrine) body = U.renderShrine(g);
    else body = `<div class="panel"><p>Pantalla desconocida: ${esc(g.screen)}</p><button class="btn btn-primary mt-2" data-action="back-menu">Volver al menú</button></div>`;
    return U.renderHud(g) + body;
  };

  /* ---------------- HUD ---------------- */
  U.renderHud = function (g) {
    const s = E.stats(g);
    const p = g.player;
    const cls = D.byId.classes[p.classId];
    const xp = E.xpProgress(g);
    const potions = Object.keys(p.potions || {}).reduce((a, k) => a + (p.potions[k] || 0), 0);
    return `<div class="hud">
      <div class="hud-id">
        <div class="hud-avatar" style="color:${cls.color}">${cls.icon}</div>
        <div><b>${esc(p.name)}</b><span>${esc(cls.name)} · Nv. ${p.level}</span></div>
      </div>
      <div class="hud-hp">
        <div class="bar-label"><span>Vida</span><b>${Math.max(0, Math.ceil(p.hp))}/${s.maxHp}</b></div>
        ${U.hpBar(p.hp, s.maxHp, "hp")}
      </div>
      <div class="hud-hp" style="min-width:118px">
        <div class="bar-label"><span>XP</span><b>${xp.into}/${xp.need}</b></div>
        <div class="bar" style="height:6px"><div class="bar-fill xp" style="width:${xp.pct * 100}%"></div></div>
      </div>
      <span class="hud-chip" title="Oro">🪙 <b>${p.gold}</b></span>
      <span class="hud-chip" title="Pociones">🧪 <b>${potions}</b></span>
      <span class="hud-chip" title="${esc(D.byId.difficulties[g.build.difficultyId].name)}">${D.byId.difficulties[g.build.difficultyId].icon} Etapa ${Math.min(g.stageIndex + 1, g.map.length)}/${g.map.length}</span>
      <span class="spacer"></span>
      <button class="btn btn-icon" data-action="open-bag" title="Bolsa y personaje">🎒</button>
      <button class="btn btn-icon" data-action="open-build" title="Resumen de la partida">📜</button>
      <button class="btn btn-icon" data-action="open-menu" title="Menú">☰</button>
    </div>`;
  };

  /* ---------------- menú ---------------- */
  U.renderMenu = function () {
    const meta = E.getMeta();
    const hasRun = (RPG.game && !RPG.game.finished) || E.hasSave();
    return `<div class="menu-hero">
      <div class="menu-sigil">⚔️</div>
      <div class="eyebrow">Un RPG de rol por turnos para un solo jugador</div>
      <h1 class="title-gradient">Crónicas del Umbral</h1>
      <p class="subtitle">Elige tu clase, tu escenario y a tus enemigos. Recorre un camino distinto en cada partida y enfréntate al jefe final. Solo tú, tus decisiones y el destino.</p>
      <div class="menu-actions">
        <button class="btn btn-primary btn-lg" data-action="open-creation">🛠️ Crear expedición</button>
        <button class="btn btn-lg" data-action="new-random">🎲 Expedición aleatoria</button>
        ${hasRun ? '<button class="btn btn-lg btn-ghost" data-action="continue-game">▶️ Continuar partida</button>' : ""}
        <button class="btn btn-ghost" data-action="open-help">📖 Cómo jugar</button>
      </div>
      <div class="menu-meta">
        <span><b>${meta.runs}</b> partidas</span>
        <span><b>${meta.victories}</b> victorias</span>
        <span><b>${meta.bestScore}</b> mejor puntuación</span>
        <span><b>${meta.kills}</b> enemigos</span>
      </div>
      <div class="menu-features">
        <div class="feature"><span class="fi">🏹</span><b>6 clases únicas</b><span>Guerrero, mago, arquero, pícaro, clérigo y druida, cada una con su propio recurso y habilidades.</span></div>
        <div class="feature"><span class="fi">🗺️</span><b>Partidas ramificadas</b><span>Combates, élites, eventos, mercaderes, santuarios y descansos. Elige tu propio camino.</span></div>
        <div class="feature"><span class="fi">👑</span><b>Final con jefe</b><span>Toda partida tiene un final. Mejora, equípate y derrota al jefe antes de caer.</span></div>
      </div>
      <div class="menu-footer">HECHO PARA JUGAR EN SOLITARIO · SIN CONEXIÓN · PROGRESO GUARDADO EN TU NAVEGADOR</div>
    </div>`;
  };

  /* ---------------- creación ---------------- */
  U.rollRelics = function (includeId) {
    const pool = D.relics.filter(r => r.id !== includeId);
    const shuffled = pool.slice().sort(() => Math.random() - 0.5).slice(0, includeId ? 2 : 3);
    if (includeId) {
      const inc = D.byId.relics[includeId];
      if (inc) shuffled.push(inc);
    }
    return shuffled.sort(() => Math.random() - 0.5);
  };

  U.defaultCreation = function () {
    const relics = U.rollRelics();
    return {
      name: "Aventurero", classId: "guerrero", scenarioId: "bosque", themeId: "mixed",
      difficultyId: "aventurero", lengthId: "aventura", companionId: "lobo", patronId: "guerra",
      curseIds: [], relicId: relics[0] ? relics[0].id : "corazon", relicOptions: relics
    };
  };

  U.openCreation = function () {
    U.mode = "creation";
    if (!U.creation) U.creation = U.defaultCreation();
    U.modal = null;
    U.render();
  };

  U.randomizeCreation = function () {
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const curses = [];
    if (Math.random() < 0.3) {
      const pool = D.curses.slice().sort(() => Math.random() - 0.5);
      curses.push(pool[0].id);
      if (Math.random() < 0.25) curses.push(pool[1].id);
    }
    const relic = r(D.relics);
    U.creation = {
      name: U.randomHeroName(), classId: r(D.classes).id, scenarioId: r(D.scenarios).id,
      themeId: r(D.themes).id,
      difficultyId: r(D.difficulties).id, lengthId: r(D.lengths).id,
      companionId: r(D.companions).id, patronId: r(D.patrons).id,
      curseIds: curses, relicId: relic.id, relicOptions: U.rollRelics(relic.id)
    };
    U.render();
  };

  U.randomHeroName = function () {
    const names = ["Aldric", "Brynn", "Kael", "Lyra", "Dorian", "Sera", "Torvald", "Mireia", "Rook", "Isolde", "Fenris", "Ariel", "Cassian", "Nyx", "Orin", "Vesper", "Thane", "Elara", "Soren", "Maeve"];
    return names[Math.floor(Math.random() * names.length)];
  };

  function optCard(action, id, icon, name, desc, selected, extra) {
    return `<button class="opt${selected ? " selected" : ""}" data-action="${action}" data-id="${esc(id)}" type="button" aria-pressed="${selected ? "true" : "false"}">
      <span class="oi">${icon}</span>
      <span class="ob"><span class="on">${esc(name)}</span><span class="od">${desc}</span>${extra || ""}</span>
    </button>`;
  }

  U.renderCreation = function () {
    const c = U.creation || (U.creation = U.defaultCreation());
    const cls = D.byId.classes[c.classId];
    const scen = D.byId.scenarios[c.scenarioId];
    const theme = D.byId.themes[c.themeId];
    const diff = D.byId.difficulties[c.difficultyId];
    const len = D.byId.lengths[c.lengthId];
    const comp = D.byId.companions[c.companionId];
    const patron = D.byId.patrons[c.patronId];
    const relic = D.byId.relics[c.relicId];

    const classCards = D.classes.map(k => optCard("pick-class", k.id, k.icon, k.name, k.tagline,
      c.classId === k.id,
      `<span class="ostat"><span>❤️ ${k.hp}</span><span>⚔️ ${k.atk}</span><span>🛡️ ${k.def}</span><span>${k.res.icon} ${k.res.name}</span></span>`)).join("");

    const scenCards = D.scenarios.map(s => optCard("pick-scenario", s.id, s.icon, s.name, s.desc, c.scenarioId === s.id,
      `<span class="ostat"><span>${s.tip}</span></span>`)).join("");

    const themeCards = D.themes.map(t => optCard("pick-theme", t.id, t.icon, t.name, t.desc, c.themeId === t.id)).join("");

    const diffCards = D.difficulties.map(d => optCard("pick-difficulty", d.id, d.icon, d.name, d.desc, c.difficultyId === d.id,
      `<span class="ostat"><span>Enemigos ${Math.round(d.enemyHp * 100)}% vida</span><span>${Math.round(d.enemyAtk * 100)}% daño</span><span>×${d.scoreMult} puntos</span></span>`)).join("");

    const lenCards = D.lengths.map(l => optCard("pick-length", l.id, l.icon, l.name, l.desc, c.lengthId === l.id,
      `<span class="ostat"><span>${l.stages} etapas</span><span>XP ×${l.xpMult}</span></span>`)).join("");

    const compCards = D.companions.map(x => optCard("pick-companion", x.id, x.icon, x.name, x.desc, c.companionId === x.id)).join("");
    const patronCards = D.patrons.map(x => optCard("pick-patron", x.id, x.icon, x.name, x.desc, c.patronId === x.id)).join("");
    const curseCards = D.curses.map(x => {
      const sel = c.curseIds.includes(x.id);
      return `<button class="curse-toggle${sel ? " selected" : ""}" data-action="toggle-curse" data-id="${x.id}" type="button" aria-pressed="${sel}">
        <span class="ci">${x.icon}</span><span><b>${esc(x.name)}</b><span>${esc(x.desc)}</span></span></button>`;
    }).join("");
    const relicCards = (c.relicOptions || []).map(r => `<button class="relic-card${c.relicId === r.id ? " selected" : ""}" data-action="pick-relic" data-id="${r.id}" type="button">
      <span class="ri">${r.icon}</span><span><b>${esc(r.name)}</b><span>${esc(r.desc)}</span></span></button>`).join("");

    const diffNote = c.difficultyId === "leyenda" ? '<div class="warn-box mt-2">Modo Leyenda: sin resurrecciones. Una derrota termina la partida.</div>' : "";

    const summary = `<div class="panel creation-side">
      <div class="summary-hero">
        <div class="eyebrow" style="font-size:9.5px">Tu expedición</div>
        <div class="big">${esc(c.name || "Aventurero")}</div>
        <div class="cls">${cls.icon} ${esc(cls.name)} · ${diff.icon} ${esc(diff.name)}</div>
      </div>
      <div class="summary-stats">
        <div class="summary-stat"><span>Vida</span><b>${cls.hp}</b></div>
        <div class="summary-stat"><span>Ataque</span><b>${cls.atk}</b></div>
        <div class="summary-stat"><span>Defensa</span><b>${cls.def}</b></div>
        <div class="summary-stat"><span>Crítico</span><b>${pct(cls.crit)}</b></div>
        <div class="summary-stat"><span>${cls.res.icon} ${esc(cls.res.name)}</span><b>${cls.res.max}</b></div>
        <div class="summary-stat"><span>Etapas</span><b>${len.stages}</b></div>
      </div>
      <div class="summary-list">
        <div><span>Escenario</span><b>${scen.icon} ${esc(scen.name)}</b></div>
        <div><span>Enemigos</span><b>${theme.icon} ${esc(theme.name)}</b></div>
        <div><span>Duración</span><b>${len.icon} ${esc(len.name)}</b></div>
        <div><span>Compañero</span><b>${comp.icon} ${esc(comp.name)}</b></div>
        <div><span>Patrón</span><b>${patron.icon} ${esc(patron.name)}</b></div>
        <div><span>Reliquia</span><b>${relic ? relic.icon + " " + esc(relic.name) : "—"}</b></div>
        ${c.curseIds.length ? `<div><span>Maldiciones</span><b class="curse">${c.curseIds.map(id => D.byId.curses[id].name).join(", ")}</b></div>` : ""}
      </div>
      <div class="rule" style="margin:12px 0"></div>
      <button class="btn btn-primary btn-block btn-lg" data-action="start-game">Comenzar expedición ⚔️</button>
      <button class="btn btn-ghost btn-block mt-1" data-action="randomize-creation">🎲 Aleatorizarlo todo</button>
      <button class="btn btn-ghost btn-block mt-1" data-action="back-menu">← Volver al menú</button>
      <p class="tiny muted center mt-1" style="line-height:1.45">La partida se guarda automáticamente. Puedes continuar más tarde.</p>
    </div>`;

    return `<div class="creation-layout">
      <div class="creation-main">
        <div class="row-wrap mb-1">
          <div><div class="eyebrow">Paso 1 de 1</div><h2>Forja tu leyenda</h2></div>
          <span class="spacer"></span>
          <button class="btn btn-sm" data-action="randomize-creation">🎲 Todo aleatorio</button>
          <button class="btn btn-sm btn-ghost" data-action="back-menu">← Menú</button>
        </div>
        <div class="panel form-section">
          <header><span class="n">01</span><h3>Nombre del héroe</h3><span class="hint">Así te recordará el mundo</span></header>
          <input class="name-input" data-input="name" maxlength="24" value="${esc(c.name)}" placeholder="Escribe un nombre..." aria-label="Nombre del héroe">
        </div>
        <div class="panel form-section">
          <header><span class="n">02</span><h3>Clase</h3><span class="hint">Recurso, pasiva y 4 habilidades propias</span></header>
          <div class="opt-grid cols-3">${classCards}</div>
          <div class="panel-flat mt-2"><div class="row"><span style="font-size:22px">${cls.icon}</span><div><b class="serif">${esc(cls.name)}</b><div class="small muted">${esc(cls.desc)}</div></div></div>
            <div class="small mt-1"><span class="gold">Pasiva · ${esc(cls.passive.name)}:</span> ${esc(cls.passive.desc)}</div>
            <div class="chip-row mt-1">${cls.skills.map(k => `<span class="relic-chip" title="${esc(k.desc)}">${k.icon} ${esc(k.name)} · ${k.cost}</span>`).join("")}</div>
          </div>
        </div>
        <div class="panel form-section">
          <header><span class="n">03</span><h3>Escenario inicial</h3><span class="hint">Dónde comienza tu viaje</span></header>
          <div class="opt-grid cols-2">${scenCards}</div>
        </div>
        <div class="panel form-section">
          <header><span class="n">04</span><h3>Temática de enemigos</h3><span class="hint">Quién te saldrá al paso</span></header>
          <div class="opt-grid cols-3">${themeCards}</div>
        </div>
        <div class="panel form-section">
          <header><span class="n">05</span><h3>Dificultad</h3></header>
          <div class="opt-grid cols-2">${diffCards}</div>
          ${diffNote}
        </div>
        <div class="panel form-section">
          <header><span class="n">06</span><h3>Duración</h3><span class="hint">Cuántas etapas hasta el jefe</span></header>
          <div class="opt-grid cols-3">${lenCards}</div>
        </div>
        <div class="panel form-section">
          <header><span class="n">07</span><h3>Compañero</h3><span class="hint">Actúa solo, cada ciertos turnos</span></header>
          <div class="opt-grid cols-2">${compCards}</div>
        </div>
        <div class="panel form-section">
          <header><span class="n">08</span><h3>Patrón</h3><span class="hint">Una bendición permanente</span></header>
          <div class="opt-grid cols-2">${patronCards}</div>
        </div>
        <div class="panel form-section">
          <header><span class="n">09</span><h3>Reliquia inicial</h3><span class="hint">Elige una de tres</span></header>
          <div class="relic-choice">${relicCards}</div>
        </div>
        <div class="panel form-section">
          <header><span class="n">10</span><h3>Maldiciones <span class="tiny muted">(opcional, máx. 2)</span></h3><span class="hint">Más riesgo, más recompensa</span></header>
          <div class="curse-list">${curseCards}</div>
        </div>
      </div>
      ${summary}
    </div>`;
  };

  /* ---------------- mapa ---------------- */
  U.renderMap = function (g) {
    const scen = D.byId.scenarios[g.build.scenarioId];
    const len = D.byId.lengths[g.build.lengthId];
    const diff = D.byId.difficulties[g.build.difficultyId];
    const theme = D.byId.themes[g.build.themeId];
    const progress = Math.min(1, g.stageIndex / (g.map.length - 1));
    const stagesHtml = g.map.map((stage, i) => {
      const state = i < g.stageIndex ? "done" : i === g.stageIndex ? "current" : "locked";
      const nodes = stage.options.map(n => {
        const t = E.NODE_TYPES[n.type] || { name: n.type, icon: "❓", desc: "" };
        const isBoss = n.type === "boss";
        return `<button class="node ${n.type}" data-action="choose-node" data-id="${n.id}" ${state !== "current" ? "disabled" : ""} type="button">
          <span class="ni">${isBoss ? "👑" : t.icon}</span>
          <b>${esc(isBoss ? "Jefe Final" : t.name)}</b>
          <span>${esc(isBoss ? "El enfrentamiento decisivo." : t.desc)}</span>
        </button>`;
      }).join("");
      return `<div class="map-stage ${state}">
        <div class="stage-marker"><div class="dot"></div><div class="n">${i + 1}</div><div class="line"></div></div>
        <div class="node-grid">${nodes}</div>
      </div>`;
    }).join("");

    return `<div class="act-banner" style="background:linear-gradient(90deg,rgba(212,175,55,.12),rgba(155,107,214,.06),transparent)">
        <div class="ai">${scen.icon}</div>
        <div><b>${esc(scen.name)}</b><span>${esc(scen.greeting)}</span></div>
        <span class="spacer"></span>
        <div class="tag">${diff.icon} ${esc(diff.name)}</div>
      </div>
      <div class="map-head">
        <div><div class="eyebrow">Etapa ${Math.min(g.stageIndex + 1, g.map.length)} de ${g.map.length}</div><h2>Elige tu camino</h2><p>${theme.icon} ${esc(theme.name)} · ${len.icon} ${esc(len.name)} · ${esc(scen.tip)}</p></div>
        <span class="spacer"></span>
        <div class="row small muted"><span>Progreso</span><div class="bar" style="width:120px"><div class="bar-fill xp" style="width:${progress * 100}%"></div></div></div>
      </div>
      <div class="map-track">${stagesHtml}</div>
      <div class="legend">
        <span>⚔️ Combate</span><span>💀 Élite</span><span>❓ Evento</span><span>🔥 Descanso</span>
        <span>🏪 Mercader</span><span>💎 Tesoro</span><span>⛩️ Santuario</span><span>👑 Jefe final</span>
      </div>`;
  };

  /* ---------------- modales ---------------- */
  U.renderModal = function () {
    if (!U.modal) return "";
    const g = RPG.game;
    let title = "", body = "";
    if (U.modal.type === "help") {
      title = "Cómo jugar";
      body = `<div class="help-body">
        <h3>Objetivo</h3>
        <p>Es una partida de rol en solitario. Recorre las etapas de tu expedición, hazte más fuerte y derrota al <b>jefe final</b>. Si caes, la partida termina (salvo que tengas una resurrección).</p>
        <h3>El camino</h3>
        <p>En cada etapa eliges entre varias rutas: <b>combates</b>, <b>élites</b>, <b>eventos</b>, <b>descansos</b>, <b>mercaderes</b>, <b>tesoros</b> y <b>santuarios</b>. No puedes volver atrás. La última etapa es siempre el jefe.</p>
        <h3>Combate por turnos</h3>
        <ul>
          <li>Cada enemigo muestra su <b>intención</b> antes de actuar. Úsala para decidir si atacas, te defiendes o curas.</li>
          <li><b>Atacar</b> genera recurso. Las <b>habilidades</b> cuestan recurso y son más potentes.</li>
          <li><b>Defenderte</b> gana escudo para el turno enemigo. El escudo no se acumula entre rondas.</li>
          <li>Puedes usar <b>pociones</b> en combate, pero consumen tu turno.</li>
          <li>Los estados alterados (quemadura, veneno, sangrado, debilidad...) pueden cambiar el rumbo.</li>
        </ul>
        <h3>Progresión</h3>
        <ul>
          <li>Ganas <b>experiencia</b> y <b>oro</b>. Al subir de nivel eliges una <b>mejora</b> entre tres.</li>
          <li>Los enemigos sueltan <b>equipo</b>: armas, armaduras y amuletos. Se equipan automáticamente si el hueco está libre.</li>
          <li>Las <b>reliquias</b> y los <b>patrones</b> dan bonus permanentes durante toda la partida.</li>
          <li>Las <b>maldiciones</b> son opcionales: añaden dificultad a cambio de una recompensa inicial.</li>
        </ul>
        <h3>Dos modos</h3>
        <p><b>Crear expedición</b> te deja elegir clase, escenario, enemigos, dificultad, duración, compañero, patrón, reliquia y maldiciones. <b>Expedición aleatoria</b> lo decide todo por ti: perfecta para descubrir combinaciones nuevas.</p>
        <h3>Atajos de teclado (combate)</h3>
        <p><span class="kbd">A</span> atacar · <span class="kbd">1</span>-<span class="kbd">4</span> habilidades · <span class="kbd">D</span> defender · <span class="kbd">Q</span> pociones · <span class="kbd">Esc</span> cancelar objetivo.</p>
        <h3>Guardado</h3>
        <p>La partida se guarda automáticamente después de cada acción. Puedes cerrar el navegador y continuar después desde el menú.</p>
      </div>`;
    } else if (U.modal.type === "bag" && g) {
      title = "Bolsa y personaje";
      const p = g.player, s = E.stats(g), cls = D.byId.classes[p.classId];
      const inCombat = g.screen === "combat";
      const slots = ["weapon", "armor", "trinket"].map(slot => {
        const it = p.equipment[slot];
        return `<div class="equip-slot">
          <span class="sl">${D.itemSlots[slot].icon} ${U.slotName(slot)}</span>
          ${it ? `<b>${it.icon} ${esc(it.name)}</b><span>${it.stats && Object.keys(it.stats).length ? U.statChips(it.stats) : "—"}</span>
            ${inCombat ? "" : `<button class="btn btn-sm btn-ghost mt-1" data-action="unequip-item" data-slot="${slot}">Desequipar</button>`}` : '<span class="muted">Vacío</span>'}
        </div>`;
      }).join("");
      const items = p.items.length ? p.items.map(it => `<div class="bag-item ${U.rarityClass(it.rarity)}">
          <b>${it.icon} ${esc(it.name)}</b>
          <span>${U.slotName(it.slot)} · ${RARITY[it.rarity] || it.rarity}</span>
          <div class="stats">${U.statChips(it.stats)}</div>
          ${inCombat ? '<span class="tiny muted mt-1">No puedes cambiar de equipo en combate.</span>' : `<button class="btn btn-sm btn-block mt-1" data-action="equip-item" data-uid="${it.uid}">Equipar</button>`}
        </div>`).join("") : '<p class="muted small">La bolsa está vacía.</p>';
      const potions = Object.keys(p.potions || {}).filter(k => p.potions[k] > 0).map(id => {
        const po = D.byId.potions[id];
        return po ? `<span class="relic-chip">${po.icon} ${esc(po.name)} ×${p.potions[id]}</span>` : "";
      }).join("") || '<span class="tiny muted">Sin pociones.</span>';
      const perks = (p.perkIds || []).map(id => { const pk = D.byId.perks[id]; return pk ? `<span class="relic-chip" title="${esc(pk.desc)}">${pk.icon} ${esc(pk.name)}</span>` : ""; }).join("") || '<span class="tiny muted">Ninguna.</span>';
      body = `<div class="equip-slots">${slots}</div>
        <div class="divider-label">Estadísticas</div>
        <div class="summary-stats">
          <div class="summary-stat"><span>❤️ Vida</span><b>${Math.ceil(p.hp)}/${s.maxHp}</b></div>
          <div class="summary-stat"><span>⚔️ Ataque</span><b>${s.atk}</b></div>
          <div class="summary-stat"><span>🛡️ Defensa</span><b>${s.def}</b></div>
          <div class="summary-stat"><span>🎯 Crítico</span><b>${pct(s.crit)}</b></div>
          <div class="summary-stat"><span>💥 Daño crít.</span><b>${Math.round(s.critDmg * 100)}%</b></div>
          <div class="summary-stat"><span>${cls.res.icon} ${esc(cls.res.name)}</span><b>${s.resMax}</b></div>
        </div>
        <div class="divider-label">Bolsa (${p.items.length})</div>
        <div class="bag-grid">${items}</div>
        <div class="divider-label">Pociones</div><div class="chip-row">${potions}</div>
        <div class="divider-label">Reliquias</div><div class="chip-row">${U.relicChips(p.relicIds)}</div>
        <div class="divider-label">Mejoras</div><div class="chip-row">${perks}</div>`;
    } else if (U.modal.type === "build" && g) {
      title = "Resumen de la expedición";
      const b = g.build;
      const scen = D.byId.scenarios[b.scenarioId], theme = D.byId.themes[b.themeId];
      const diff = D.byId.difficulties[b.difficultyId], len = D.byId.lengths[b.lengthId];
      const comp = D.byId.companions[b.companionId], patron = D.byId.patrons[b.patronId];
      const s = E.stats(g);
      body = `<div class="summary-stats">
          <div class="summary-stat"><span>Clase</span><b>${D.byId.classes[b.classId].name}</b></div>
          <div class="summary-stat"><span>Nivel</span><b>${g.player.level}</b></div>
          <div class="summary-stat"><span>Etapa</span><b>${Math.min(g.stageIndex + 1, g.map.length)}/${g.map.length}</b></div>
          <div class="summary-stat"><span>Oro</span><b>${g.player.gold}</b></div>
          <div class="summary-stat"><span>Enemigos</span><b>${g.stats.kills}</b></div>
          <div class="summary-stat"><span>Daño infligido</span><b>${g.stats.damageDealt}</b></div>
        </div>
        <div class="summary-list">
          <div><span>Escenario</span><b>${scen.icon} ${esc(scen.name)}</b></div>
          <div><span>Temática</span><b>${theme.icon} ${esc(theme.name)}</b></div>
          <div><span>Dificultad</span><b>${diff.icon} ${esc(diff.name)}</b></div>
          <div><span>Duración</span><b>${len.icon} ${esc(len.name)}</b></div>
          <div><span>Compañero</span><b>${comp.icon} ${esc(comp.name)}</b></div>
          <div><span>Patrón</span><b>${patron.icon} ${esc(patron.name)}</b></div>
          ${(b.curseIds || []).length ? `<div><span>Maldiciones</span><b class="curse">${b.curseIds.map(id => D.byId.curses[id].name).join(", ")}</b></div>` : ""}
        </div>
        <div class="divider-label">Reliquias</div><div class="chip-row">${U.relicChips(g.player.relicIds)}</div>
        <div class="divider-label">Estados actuales</div><div class="status-row">${U.statusChips(g.combat ? g.combat.playerStatuses : []) || '<span class="tiny muted">Ninguno.</span>'}</div>`;
    } else if (U.modal.type === "confirm-menu") {
      title = "Menú de partida";
      body = `<p class="muted">La partida está guardada. ¿Qué quieres hacer?</p>
        <div class="choice-list">
          <button class="choice" data-action="close-modal"><span><span class="cn">▶️ Seguir jugando</span><span class="cd">Volver a la expedición.</span></span><span class="arrow">→</span></button>
          <button class="choice" data-action="go-menu"><span><span class="cn">🏠 Ir al menú principal</span><span class="cd">Tu progreso queda guardado. Podrás continuar desde el menú.</span></span><span class="arrow">→</span></button>
          <button class="choice" data-action="confirm-abandon"><span><span class="cn red">☠️ Abandonar la partida</span><span class="cd">Pierdes el progreso actual y cuenta como derrota.</span></span><span class="arrow">→</span></button>
        </div>`;
    } else if (U.modal.type === "confirm-abandon") {
      title = "¿Abandonar la expedición?";
      body = `<div class="warn-box">Esta acción no se puede deshacer. La partida actual se perderá y contará como una derrota en tus estadísticas.</div>
        <div class="row mt-3"><button class="btn btn-ghost" data-action="close-modal">Cancelar</button><span class="spacer"></span><button class="btn btn-danger" data-action="do-abandon">☠️ Abandonar</button></div>`;
    }
    return `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head"><h2>${esc(title)}</h2><button class="btn btn-icon" data-action="close-modal" aria-label="Cerrar">✕</button></div>
      ${body}
    </div></div>`;
  };

  /* ---------------- avisos y animaciones ---------------- */
  U.toast = function (text, cls) {
    const box = document.getElementById("toasts");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast " + (cls || "");
    el.textContent = text;
    box.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 3200);
  };

  U.playEvents = function (events) {
    if (!events || !events.length) return;
    const layer = document.getElementById("floaters");
    if (!layer) return;
    for (const ev of events) {
      let anchor = null;
      if (ev.uid) anchor = document.querySelector('.enemy[data-uid="' + ev.uid + '"]');
      if (!anchor && ev.side === "player") anchor = document.querySelector(".player-panel") || document.querySelector(".hud-hp");
      if (!anchor) continue;
      const r = anchor.getBoundingClientRect();
      let text = "", cls = "dmg";
      if (ev.type === "dmg") {
        if (ev.amount > 0) {
          text = (ev.crit ? "¡" : "-") + ev.amount + (ev.crit ? "!" : "");
          cls = ev.crit ? "crit" : "dmg";
        } else { text = "Bloqueado"; cls = "shield"; }
      } else if (ev.type === "heal") {
        text = "+" + ev.amount; cls = "heal";
      } else if (ev.type === "shield") {
        text = "+" + ev.amount + " 🛡️"; cls = "shield";
      } else if (ev.type === "miss") {
        text = "Esquiva"; cls = "miss";
      } else if (ev.type === "status") {
        const info = D.statuses[ev.status] || { icon: "•" };
        text = info.icon; cls = "miss";
      } else if (ev.type === "die") {
        text = "☠️"; cls = "crit";
      } else if (ev.type === "buff") {
        text = "😡"; cls = "crit";
      } else {
        continue;
      }
      const f = document.createElement("div");
      f.className = "floater " + cls;
      f.textContent = text;
      f.style.left = (r.left + r.width / 2) + "px";
      f.style.top = (r.top + Math.min(r.height * 0.45, 60)) + "px";
      layer.appendChild(f);
      setTimeout(() => f.remove(), 1050);
    }
  };

  U.afterRender = function () {
    const log = document.querySelector(".combat-log");
    if (log) log.scrollTop = log.scrollHeight;
  };

  U.afterAction = function (events) {
    U.lastEvents = events || [];
    U.render();
    U.playEvents(U.lastEvents);
  };

  /* ---------------- acciones base ---------------- */
  U.actions["open-creation"] = () => { U.openCreation(); };
  U.actions["randomize-creation"] = () => { U.randomizeCreation(); };
  U.actions["back-menu"] = () => { U.mode = "menu"; U.creation = null; U.modal = null; U.render(); };
  U.actions["new-random"] = () => {
    const build = E.randomBuild();
    const name = U.randomHeroName();
    const g = E.newGame(build, name, "random");
    U.mode = null;
    U.targeting = null;
    U.modal = null;
    U.render();
    const cls = D.byId.classes[g.build.classId];
    const scen = D.byId.scenarios[g.build.scenarioId];
    U.toast(`Expedición aleatoria: ${cls.name} en ${scen.name}.`, "good");
  };
  U.actions["continue-game"] = () => {
    if (RPG.game && !RPG.game.finished) { U.mode = null; U.render(); return; }
    const g = E.loadSave();
    if (g) { U.mode = null; U.render(); U.toast("Partida recuperada.", "good"); }
    else U.toast("No hay ninguna partida guardada.", "bad");
  };
  U.actions["open-help"] = () => { U.modal = { type: "help" }; U.render(); };
  U.actions["close-modal"] = () => { U.modal = null; U.render(); };
  U.actions["open-bag"] = () => { U.modal = { type: "bag" }; U.render(); };
  U.actions["open-build"] = () => { U.modal = { type: "build" }; U.render(); };
  U.actions["open-menu"] = () => { U.modal = { type: "confirm-menu" }; U.render(); };
  U.actions["confirm-abandon"] = () => { U.modal = { type: "confirm-abandon" }; U.render(); };
  U.actions["go-menu"] = () => {
    U.modal = null; U.mode = "menu";
    if (RPG.game && !RPG.game.finished) E.save(RPG.game);
    U.render();
  };
  U.actions["do-abandon"] = () => {
    if (!RPG.game) return;
    E.abandon(RPG.game);
    U.modal = null;
    U.mode = null;
    U.render();
  };
  U.actions["equip-item"] = (ds) => {
    if (!RPG.game || RPG.game.screen === "combat") return;
    if (E.equipItem(RPG.game, ds.uid)) {
      U.render();
      U.toast("Objeto equipado.", "good");
    }
  };
  U.actions["unequip-item"] = (ds) => {
    if (!RPG.game || RPG.game.screen === "combat") return;
    if (E.unequipItem(RPG.game, ds.slot)) {
      U.render();
      U.toast("Objeto guardado en la bolsa.", "");
    }
  };
  U.actions["start-game"] = () => {
    const c = U.creation || U.defaultCreation();
    if ((c.curseIds || []).length > 2) c.curseIds = c.curseIds.slice(0, 2);
    const build = {
      classId: c.classId, scenarioId: c.scenarioId, themeId: c.themeId,
      difficultyId: c.difficultyId, lengthId: c.lengthId, companionId: c.companionId,
      patronId: c.patronId, curseIds: c.curseIds, relicId: c.relicId
    };
    E.newGame(build, c.name || "Aventurero", "custom");
    U.mode = null;
    U.targeting = null;
    U.modal = null;
    U.creation = null;
    U.render();
    U.toast("Tu expedición comienza. ¡Buena suerte!", "good");
  };
  U.actions["choose-node"] = (ds) => {
    const g = RPG.game;
    if (!g) return;
    U.targeting = null;
    const ok = E.startNode(g, ds.id);
    if (ok) U.render();
    else U.toast("No puedes elegir esa ruta ahora.", "bad");
  };
  U.actions["new-run"] = () => {
    RPG.game = null;
    U.mode = "creation";
    U.creation = U.defaultCreation();
    U.modal = null;
    U.render();
  };
  U.actions["back-to-menu"] = () => {
    RPG.game = null;
    U.mode = "menu";
    U.modal = null;
    U.render();
  };

  const picker = (key) => (ds) => {
    if (!U.creation) return;
    U.creation[key] = ds.id;
    U.render();
  };
  U.actions["pick-class"] = picker("classId");
  U.actions["pick-scenario"] = picker("scenarioId");
  U.actions["pick-theme"] = picker("themeId");
  U.actions["pick-difficulty"] = picker("difficultyId");
  U.actions["pick-length"] = picker("lengthId");
  U.actions["pick-companion"] = picker("companionId");
  U.actions["pick-patron"] = picker("patronId");
  U.actions["pick-relic"] = picker("relicId");
  U.actions["toggle-curse"] = (ds) => {
    if (!U.creation) return;
    const id = ds.id;
    const arr = U.creation.curseIds || [];
    if (arr.includes(id)) U.creation.curseIds = arr.filter(x => x !== id);
    else if (arr.length >= 2) { U.toast("Puedes elegir como máximo 2 maldiciones.", "bad"); return; }
    else U.creation.curseIds = arr.concat([id]);
    U.render();
  };

  /* ---------------- eventos globales ---------------- */
  U.bind = function () {
    document.addEventListener("click", (e) => {
      const back = e.target.closest(".modal-back");
      if (back && e.target === back) { U.modal = null; U.render(); return; }
      const el = e.target.closest("[data-action]");
      if (!el || el.disabled) return;
      const fn = U.actions[el.dataset.action];
      if (!fn) return;
      e.preventDefault();
      fn(el.dataset, el);
    });
    document.addEventListener("input", (e) => {
      const el = e.target.closest("[data-input]");
      if (!el) return;
      if (el.dataset.input === "name" && U.creation) {
        U.creation.name = el.value;
        const big = document.querySelector(".creation-side .big");
        if (big) big.textContent = el.value.trim() || "Aventurero";
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (U.modal) { U.modal = null; U.render(); }
        else if (U.targeting) { U.targeting = null; U.render(); }
        return;
      }
      const g = RPG.game;
      if (!g || U.modal || g.screen !== "combat" || !g.combat || g.combat.turn !== "player") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      const key = e.key.toLowerCase();
      if (key === "a" && U.actions["combat-attack"]) { e.preventDefault(); U.actions["combat-attack"]({}); }
      else if (key === "d" && U.actions["combat-defend"]) { e.preventDefault(); U.actions["combat-defend"]({}); }
      else if (key === "q" && U.actions["combat-potions"]) { e.preventDefault(); U.actions["combat-potions"]({}); }
      else if (/^[1-4]$/.test(key) && U.actions["combat-skill"]) { e.preventDefault(); U.actions["combat-skill"]({ id: key }); }
    });
  };

  U.init = function () {
    U.mode = "menu";
    U.creation = null;
    U.bind();
    U.render();
  };
})();

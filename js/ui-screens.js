/* ============================================================
   Crónicas del Umbral — interfaz: combate y pantallas de nodo
   ============================================================ */
(function () {
  "use strict";
  const RPG = (globalThis.RPG = globalThis.RPG || {});
  const D = RPG.data;
  const E = RPG.engine;
  const U = RPG.ui;
  const esc = U.esc;
  const pct = U.pct;

  const baseRenderModal = U.renderModal.bind(U);

  function skillCost(g, skill) {
    return Math.max(1, Math.round(skill.cost * E.stats(g).skillCostMult));
  }

  function intentLabel(intent) {
    if (!intent) return "Preparando...";
    if (intent.type === "attack") return intent.hits ? `${intent.hits} golpes` : "Ataque";
    if (intent.type === "drain") return "Drenaje";
    if (intent.type === "debuff") return "Maleficio";
    if (intent.type === "buff") return "Se fortalece";
    if (intent.type === "buffAlly") return "Apoya a un aliado";
    if (intent.type === "defend") return "Se protege";
    if (intent.type === "heal") return "Se cura";
    return "Acción";
  }

  U.renderCombat = function (g) {
    const c = g.combat;
    if (!c) return U.renderMap(g);
    const s = E.stats(g);
    const p = g.player;
    const cls = D.byId.classes[p.classId];
    const enemiesAlive = c.enemies.filter(e => e.hp > 0);
    const targeting = U.targeting;
    const tierName = c.tier === "boss" ? "Jefe Final" : c.tier === "elite" ? "Élite" : "Combate";

    const enemyCards = c.enemies.map(en => {
      const dead = en.hp <= 0;
      const intent = en.intent || {};
      const danger = !dead && intent.type === "attack" && (intent.mult || 1) >= 1.3;
      const canTarget = !dead && targeting;
      const hpPct = Math.max(0, en.hp / en.maxHp);
      return `<div class="enemy ${dead ? "dead" : ""} ${canTarget ? "selectable" : ""}" data-uid="${en.uid}" ${canTarget ? 'data-action="combat-target"' : ""}>
        <div class="enemy-head">
          <div class="enemy-icon">${en.icon}</div>
          <div class="enemy-name"><b>${esc(en.name)}</b><span class="lvl">${en.tier === "boss" ? "Jefe" : en.tier === "elite" ? "Élite" : "Criatura"} · ${esc(en.role)}</span></div>
          ${en.shield > 0 ? `<span class="shield-pill">🛡️ ${en.shield}</span>` : ""}
        </div>
        <div>
          <div class="bar-label"><span>Vida</span><b>${Math.max(0, Math.ceil(en.hp))}/${en.maxHp}</b></div>
          <div class="bar"><div class="bar-fill enemy" style="width:${hpPct * 100}%"></div></div>
        </div>
        <div class="status-row">${U.statusChips(en.statuses)}</div>
        ${dead ? '<div class="tiny muted">Derrotado</div>' : `<div class="intent ${danger ? "danger" : ""}"><span class="ii">${intent.icon || "❔"}</span><span>${esc(intent.name || "?")}</span><span class="spacer"></span><b>${esc(intentLabel(intent))}</b></div>`}
      </div>`;
    }).join("");

    const skillButtons = cls.skills.map((sk, i) => {
      const cost = skillCost(g, sk);
      const off = p.energy < cost;
      return `<button class="action" data-action="combat-skill" data-id="${sk.id}" ${off ? "disabled" : ""} title="${esc(sk.desc)}">
        <span class="cost">${cost}</span>
        <span class="ai">${sk.icon}</span>
        <span class="ab"><span class="an">${esc(sk.name)}</span><span class="ad">${esc(sk.desc.length > 54 ? sk.desc.slice(0, 52) + "…" : sk.desc)}</span></span>
      </button>`;
    }).join("");

    const potionKeys = Object.keys(p.potions || {}).filter(k => p.potions[k] > 0);
    const potionButtons = potionKeys.length ? potionKeys.map(id => {
      const po = D.byId.potions[id];
      return `<button class="potion-btn" data-action="combat-potion" data-id="${id}">
        <span class="pi">${po.icon}</span><span class="pn">${esc(po.name)}</span><span class="pc">×${p.potions[id]}</span>
      </button>`;
    }).join("") : '<p class="tiny muted">No te quedan pociones.</p>';

    const comp = D.byId.companions[g.build.companionId];
    const compChip = comp && comp.id !== "ninguno"
      ? `<div class="companion-chip"><span style="font-size:16px">${comp.icon}</span><span>${esc(comp.name)}</span><span class="cd">${c.companionCd > 0 ? "actúa en " + c.companionCd + " turno(s)" : "¡actúa ahora!"}</span></div>`
      : "";

    const logHtml = c.log.slice(-12).map(l => `<div class="l ${l.cls || ""}">${l.text}</div>`).join("");
    const targetName = targeting
      ? (targeting.kind === "attack" ? "Ataque básico" : ((cls.skills.find(k => k.id === targeting.skillId) || {}).name || "Habilidad"))
      : null;

    return `<div class="combat-top">
        <span class="round-pill">Ronda ${c.round}</span>
        <span class="tag">${c.tier === "boss" ? "👑" : c.tier === "elite" ? "💀" : "⚔️"} ${esc(tierName)}</span>
        <span class="spacer"></span>
        <span class="tiny muted">Enemigos vivos: ${enemiesAlive.length}</span>
      </div>
      <div class="combat-arena">${enemyCards}</div>
      <div class="combat-log">${logHtml || '<div class="l muted">El combate está a punto de comenzar...</div>'}</div>
      <div class="combat-bottom">
        <div class="panel player-panel">
          <div class="player-head">
            <div class="player-icon" style="color:${cls.color}">${cls.icon}</div>
            <div class="player-meta"><b>${esc(p.name)}</b><span>${esc(cls.name)} · Nivel ${p.level} · ${esc(D.byId.difficulties[g.build.difficultyId].name)}</span></div>
            <span class="spacer"></span>
            <span class="shield-pill">🛡️ ${c.shield}</span>
          </div>
          <div class="bar-label"><span>❤️ Vida</span><b>${Math.max(0, Math.ceil(p.hp))}/${s.maxHp}</b></div>
          ${U.hpBar(p.hp, s.maxHp, "hp")}
          <div class="bar-label mt-1"><span>${cls.res.icon} ${esc(cls.res.name)}</span><b>${Math.round(p.energy)}/${s.resMax}</b></div>
          ${U.resBar(p.energy, s.resMax)}
          <div class="status-row">${U.statusChips(c.playerStatuses) || '<span class="tiny muted">Sin estados alterados.</span>'}</div>
          <div class="action-bar">
            <button class="action attack" data-action="combat-attack"><span class="ai">⚔️</span><span class="ab"><span class="an">Atacar</span><span class="ad">Daño básico · genera ${cls.res.icon}</span></span></button>
            ${skillButtons}
            <button class="action defend" data-action="combat-defend"><span class="ai">🛡️</span><span class="ab"><span class="an">Defender</span><span class="ad">Escudo para este turno</span></span></button>
            <button class="action" data-action="combat-potions"><span class="ai">🧪</span><span class="ab"><span class="an">Pociones</span><span class="ad">${potionKeys.length} disponibles</span></span></button>
            ${c.tier !== "boss" ? '<button class="action flee" data-action="combat-flee"><span class="ai">🏃</span><span class="ab"><span class="an">Huir</span><span class="ad">Pierdes las recompensas</span></span></button>' : ""}
          </div>
        </div>
        <div class="combat-side">
          <div class="panel-flat">
            <div class="side-title">Pociones</div>
            <div class="potion-row">${potionButtons}</div>
          </div>
          ${compChip ? `<div class="panel-flat">${compChip}</div>` : ""}
          <div class="panel-flat">
            <div class="side-title">Consejo</div>
            <p class="tiny muted" style="line-height:1.5">El escudo se reinicia al comenzar tu turno. Observa la intención enemiga: los ataques marcados en rojo son peligrosos. <span class="gold">Esc</span> cancela un objetivo.</p>
          </div>
        </div>
      </div>
      ${targeting ? `<div class="target-hint"><span>🎯 Elige un objetivo para <b>${esc(targetName)}</b>.</span><span class="spacer"></span><button class="btn btn-sm" data-action="cancel-target">Cancelar (Esc)</button></div>` : ""}`;
  };

  /* ---------------- modal de pociones ---------------- */
  U.renderModal = function () {
    if (U.modal && U.modal.type === "potions" && RPG.game && RPG.game.combat) {
      const g = RPG.game;
      const keys = Object.keys(g.player.potions || {}).filter(k => g.player.potions[k] > 0);
      const rows = keys.length ? keys.map(id => {
        const po = D.byId.potions[id];
        return `<button class="choice" data-action="combat-potion" data-id="${id}">
          <span style="font-size:22px">${po.icon}</span>
          <span><span class="cn">${esc(po.name)} <span class="muted tiny">×${g.player.potions[id]}</span></span><span class="cd">${esc(po.desc)}</span></span>
          <span class="arrow">→</span></button>`;
      }).join("") : '<p class="muted">No te quedan pociones.</p>';
      return `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head"><h2>Usar poción</h2><button class="btn btn-icon" data-action="close-modal">✕</button></div>
        <p class="muted small mb-2">Usar una poción consume tu turno.</p>
        <div class="choice-list">${rows}</div>
      </div></div>`;
    }
    return baseRenderModal();
  };

  /* ---------------- acciones de combate ---------------- */
  function enemiesAlive() {
    const c = RPG.game && RPG.game.combat;
    return c ? c.enemies.filter(e => e.hp > 0) : [];
  }

  U.actions["combat-attack"] = () => {
    const g = RPG.game;
    if (!g || !g.combat || g.combat.turn !== "player") return;
    const al = enemiesAlive();
    if (!al.length) return;
    if (U.targeting) { U.targeting = null; U.render(); return; }
    if (al.length > 1) { U.targeting = { kind: "attack" }; U.render(); return; }
    const ev = E.combatAction(g, "attack", { targetUid: al[0].uid });
    U.targeting = null;
    U.afterAction(ev);
  };

  U.actions["combat-skill"] = (ds) => {
    const g = RPG.game;
    if (!g || !g.combat || g.combat.turn !== "player") return;
    const cls = D.byId.classes[g.player.classId];
    let skill = cls.skills.find(k => k.id === ds.id);
    if (!skill && /^[1-4]$/.test(ds.id || "")) skill = cls.skills[Number(ds.id) - 1];
    if (!skill) return;
    if (U.targeting) { U.targeting = null; U.render(); return; }
    const al = enemiesAlive();
    if (!al.length) return;
    if (skill.target === "single" && al.length > 1) {
      U.targeting = { kind: "skill", skillId: skill.id };
      U.render();
      return;
    }
    const ev = E.combatAction(g, "skill", { skillId: skill.id, targetUid: al[0].uid });
    U.targeting = null;
    U.afterAction(ev);
  };

  U.actions["combat-target"] = (ds) => {
    const g = RPG.game;
    if (!g || !g.combat || !U.targeting) return;
    const t = U.targeting;
    const ev = E.combatAction(g, t.kind === "attack" ? "attack" : "skill", { targetUid: ds.uid, skillId: t.skillId });
    U.targeting = null;
    U.afterAction(ev);
  };

  U.actions["cancel-target"] = () => { U.targeting = null; U.render(); };

  U.actions["combat-defend"] = () => {
    const g = RPG.game;
    if (!g || !g.combat || g.combat.turn !== "player") return;
    const ev = E.combatAction(g, "defend", {});
    U.targeting = null;
    U.afterAction(ev);
  };

  U.actions["combat-potions"] = () => {
    const g = RPG.game;
    if (!g || !g.combat) return;
    U.modal = { type: "potions" };
    U.render();
  };

  U.actions["combat-potion"] = (ds) => {
    const g = RPG.game;
    if (!g || !g.combat || g.combat.turn !== "player") return;
    if (!E.potionCount(g, ds.id)) { U.modal = null; U.render(); return; }
    U.modal = null;
    const ev = E.combatAction(g, "potion", { potionId: ds.id });
    U.targeting = null;
    U.afterAction(ev);
  };

  U.actions["combat-flee"] = () => {
    const g = RPG.game;
    if (!g || !g.combat || g.combat.turn !== "player") return;
    const ev = E.combatAction(g, "flee", {});
    U.targeting = null;
    U.afterAction(ev);
  };

  /* ---------------- recompensas ---------------- */
  function lootCard(it, action, idx, note) {
    return `<button class="loot-card ${U.rarityClass(it.rarity)}" data-action="${action}" data-idx="${idx}">
      <span class="li">${it.icon}</span>
      <span class="rarity-tag">${U.RARITY[it.rarity] || it.rarity}</span>
      <b>${esc(it.name)}</b>
      <span class="slot">${U.slotName(it.slot)}</span>
      <span class="stats">${U.statChips(it.stats)}</span>
      <span class="flavor">${esc(it.desc || "")}</span>
      ${note ? `<span class="flavor gold">${esc(note)}</span>` : ""}
    </button>`;
  }

  U.renderRewards = function (g) {
    const p = g.pending;
    if (!p) return U.renderMap(g);
    const equippedNote = (it) => {
      const cur = g.player.equipment[it.slot];
      if (!cur) return "Se equipará automáticamente";
      return "Sustituirá a " + cur.name;
    };
    return `<div class="screen-narrow">
      <div class="reward-head">
        <span class="bi">🏆</span>
        <h2>Victoria</h2>
        <p class="muted">El polvo se asienta. Registras lo que queda entre los restos.</p>
      </div>
      <div class="reward-summary">
        <div class="reward-pill">🪙 <b>+${p.gold}</b> oro</div>
        <div class="reward-pill">📜 <b>+${p.xp}</b> XP</div>
        ${p.healed ? `<div class="reward-pill">💚 <b>+${p.healed}</b> vida</div>` : ""}
        ${p.potion ? '<div class="reward-pill">🧪 <b>+1</b> poción de vida</div>' : ""}
        ${p.bonusRelic ? '<div class="reward-pill">✨ <b>Reliquia</b> extra</div>' : ""}
      </div>
      ${p.items && p.items.length ? `<div class="eyebrow center mb-1">Elige un botín</div>
        <div class="loot-grid">${p.items.map((it, i) => lootCard(it, "reward-item", i, equippedNote(it))).join("")}</div>` : ""}
      <div class="center mt-3">
        <button class="btn btn-ghost" data-action="reward-skip">Continuar sin objeto →</button>
      </div>
    </div>`;
  };

  U.actions["reward-item"] = (ds) => {
    const g = RPG.game;
    if (!g || !g.pending || g.pending.type !== "rewards") return;
    const idx = Number(ds.idx);
    const item = g.pending.items && g.pending.items[idx];
    E.claimRewards(g, idx);
    U.render();
    if (item) U.toast(`Obtienes ${item.name}.`, "good");
  };
  U.actions["reward-skip"] = () => {
    const g = RPG.game;
    if (!g || !g.pending || g.pending.type !== "rewards") return;
    E.claimRewards(g, -1);
    U.render();
  };

  /* ---------------- subida de nivel ---------------- */
  U.renderPerk = function (g) {
    const p = g.pending;
    if (!p) return U.renderMap(g);
    return `<div class="screen-narrow">
      <div class="reward-head">
        <span class="bi">🌟</span>
        <h2>${esc(p.title || "Subida de nivel")}</h2>
        <p class="muted">Nivel ${g.player.level} · Elige una mejora permanente.${p.remaining > 1 ? ` Te quedan ${p.remaining} elecciones.` : ""}</p>
      </div>
      <div class="perk-grid">
        ${p.choices.map(pk => `<button class="perk-card" data-action="perk-pick" data-id="${pk.id}">
          <span class="pi">${pk.icon}</span><b>${esc(pk.name)}</b><span>${esc(pk.desc)}</span>
        </button>`).join("")}
      </div>
      <p class="center tiny muted mt-3">Las mejoras se acumulan durante toda la partida. Elige según tu estilo.</p>
    </div>`;
  };

  U.actions["perk-pick"] = (ds) => {
    const g = RPG.game;
    if (!g || !g.pending || g.pending.type !== "perk") return;
    if (E.choosePerk(g, ds.id)) {
      U.render();
    }
  };

  /* ---------------- evento ---------------- */
  U.renderEvent = function (g) {
    const ev = E.getPendingEvent(g);
    if (!ev) return U.renderMap(g);
    const choices = ev.choices.map((ch, i) => {
      const reqGold = ch.req && ch.req.gold;
      const ok = !reqGold || g.player.gold >= reqGold;
      return `<button class="choice" data-action="event-choice" data-idx="${i}" ${ok ? "" : "disabled"}>
        <span><span class="cn">${esc(ch.label)}</span><span class="cd">${esc(ch.desc || "")}</span>
        ${reqGold ? `<span class="cq">${ok ? "Cuesta " + reqGold + " de oro" : "Necesitas " + reqGold + " de oro"}</span>` : ""}</span>
        <span class="arrow">→</span>
      </button>`;
    }).join("");
    return `<div class="screen-narrow">
      <div class="panel node-hero">
        <span class="bi">${ev.icon}</span>
        <h2>${esc(ev.name)}</h2>
        <p>${esc(ev.text)}</p>
      </div>
      <div class="choice-list">${choices}</div>
    </div>`;
  };

  U.actions["event-choice"] = (ds) => {
    const g = RPG.game;
    if (!g) return;
    E.eventChoose(g, Number(ds.idx));
    U.render();
  };

  U.renderEventResult = function (g) {
    const p = g.pending;
    if (!p) return U.renderMap(g);
    const lines = (p.lines || []).length
      ? p.lines.map(l => `<div class="result-line"><span class="ri">${l.icon || "•"}</span><span class="${l.cls || ""}">${esc(l.text)}</span></div>`).join("")
      : '<div class="result-line"><span class="ri">·</span><span class="muted">No ocurre nada.</span></div>';
    return `<div class="screen-narrow">
      <div class="reward-head"><span class="bi">${p.icon || "📜"}</span><h2>${esc(p.title || "Resultado")}</h2></div>
      <div class="result-box">${lines}</div>
      <div class="center mt-3"><button class="btn btn-primary" data-action="event-continue">Continuar →</button></div>
    </div>`;
  };

  U.actions["event-continue"] = () => {
    const g = RPG.game;
    if (!g) return;
    E.dismissPending(g);
    U.render();
  };

  /* ---------------- tienda ---------------- */
  U.renderShop = function (g) {
    const p = g.pending;
    if (!p) return U.renderMap(g);
    const s = E.stats(g);
    const cards = p.stock.map((entry, i) => {
      let icon, name, sub, desc, stats = "";
      if (entry.kind === "item") {
        icon = entry.item.icon; name = entry.item.name;
        sub = `${U.slotName(entry.item.slot)} · ${U.RARITY[entry.item.rarity]}`;
        desc = entry.item.desc || "";
        stats = U.statChips(entry.item.stats);
      } else if (entry.kind === "potion") {
        const po = D.byId.potions[entry.potionId];
        icon = po.icon; name = po.name; sub = "Poción"; desc = po.desc;
      } else {
        const rel = D.byId.relics[entry.relicId];
        icon = rel.icon; name = rel.name; sub = "Reliquia"; desc = rel.desc;
      }
      const can = !entry.sold && g.player.gold >= entry.price;
      return `<div class="shop-item ${entry.kind === "item" ? U.rarityClass(entry.item.rarity) : ""} ${entry.sold ? "sold" : ""}">
        <div class="si-top"><span class="ii">${icon}</span><div><b>${esc(name)}</b><span class="tiny muted">${esc(sub)}</span></div></div>
        ${stats ? `<div class="stats" style="display:flex;gap:4px;flex-wrap:wrap;font-size:10px">${stats}</div>` : ""}
        <div class="sdesc">${esc(desc || "")}</div>
        <button class="btn btn-sm ${can ? "btn-primary" : ""} buy-btn" data-action="shop-buy" data-idx="${i}" ${can ? "" : "disabled"}>
          ${entry.sold ? "Vendido" : "🪙 " + entry.price}
        </button>
      </div>`;
    }).join("");
    return `<div class="screen-mid">
      <div class="node-hero">
        <span class="bi">🏪</span>
        <h2>Mercader Errante</h2>
        <p>«Tengo reliquias de lugares que ya no existen. Todo tiene un precio, amigo mío.»</p>
        <div class="row center mt-2"><span class="gold-big">🪙 ${g.player.gold}</span><span class="muted small">oro disponible</span></div>
      </div>
      <div class="shop-grid">${cards}</div>
      <div class="center mt-3"><button class="btn btn-ghost" data-action="shop-leave">Salir de la tienda →</button></div>
    </div>`;
  };

  U.actions["shop-buy"] = (ds) => {
    const g = RPG.game;
    if (!g || !g.pending || g.pending.type !== "shop") return;
    const idx = Number(ds.idx);
    const entry = g.pending.stock[idx];
    if (E.shopBuy(g, idx)) {
      U.render();
      U.toast("Compra realizada.", "good");
    } else {
      U.toast(entry && entry.sold ? "Ya está vendido." : "No tienes oro suficiente.", "bad");
    }
  };
  U.actions["shop-leave"] = () => {
    const g = RPG.game;
    if (!g) return;
    E.shopLeave(g);
    U.render();
  };

  /* ---------------- descanso ---------------- */
  U.renderRest = function (g) {
    const s = E.stats(g);
    const heal = Math.round(s.maxHp * 0.35 * s.restHealMult);
    return `<div class="screen-narrow">
      <div class="node-hero">
        <span class="bi">🔥</span>
        <h2>Fogata en el camino</h2>
        <p>El fuego crepita y aleja a las alimañas. Tienes un momento para recuperarte antes de seguir.</p>
        <div class="row center mt-2"><span class="tag">❤️ ${Math.ceil(g.player.hp)}/${s.maxHp}</span><span class="tag">🪙 ${g.player.gold}</span></div>
      </div>
      <div class="rest-options">
        <button class="rest-opt" data-action="rest-choice" data-id="sleep">
          <span class="bi">😴</span><b>Dormir</b><span>Recupera ${heal} de vida.</span>
        </button>
        <button class="rest-opt" data-action="rest-choice" data-id="potions">
          <span class="bi">⚗️</span><b>Preparar pociones</b><span>2 pociones de vida y 1 aleatoria.</span>
        </button>
        <button class="rest-opt" data-action="rest-choice" data-id="train">
          <span class="bi">🏋️</span><b>Entrenar</b><span>+2 de ataque permanente.</span>
        </button>
        <button class="rest-opt" data-action="rest-choice" data-id="fortify">
          <span class="bi">🛡️</span><b>Reforzar defensa</b><span>+2 de defensa permanente.</span>
        </button>
      </div>
      <p class="center tiny muted mt-3">Solo puedes elegir una opción. El descanso se consume.</p>
    </div>`;
  };

  U.actions["rest-choice"] = (ds) => {
    const g = RPG.game;
    if (!g) return;
    E.restChoice(g, ds.id);
    U.render();
  };

  /* ---------------- tesoro ---------------- */
  U.renderTreasure = function (g) {
    const p = g.pending;
    if (!p) return U.renderMap(g);
    return `<div class="screen-narrow">
      <div class="node-hero">
        <span class="bi">💎</span>
        <h2>Cofre olvidado</h2>
        <p>Un cofre cubierto de polvo guarda objetos de quienes pasaron antes que tú. Solo puedes llevarte uno.</p>
        <div class="reward-summary"><div class="reward-pill">🪙 <b>+${p.gold}</b> oro</div></div>
      </div>
      <div class="loot-grid">${p.items.map((it, i) => lootCard(it, "treasure-take", i)).join("")}</div>
      <div class="center mt-3"><button class="btn btn-ghost" data-action="treasure-skip">Tomar solo el oro →</button></div>
    </div>`;
  };

  U.actions["treasure-take"] = (ds) => {
    const g = RPG.game;
    if (!g) return;
    E.treasureTake(g, Number(ds.idx));
    U.render();
  };
  U.actions["treasure-skip"] = () => {
    const g = RPG.game;
    if (!g) return;
    E.treasureSkip(g);
    U.render();
  };

  /* ---------------- santuario ---------------- */
  U.renderShrine = function (g) {
    const p = g.pending;
    if (!p) return U.renderMap(g);
    return `<div class="screen-narrow">
      <div class="node-hero">
        <span class="bi">⛩️</span>
        <h2>Santuario de los Antiguos</h2>
        <p>Un altar de piedra vibra con energía dormida. Los dioses del umbral ofrecen un único don.</p>
      </div>
      <div class="choice-list">
        ${p.options.map((op, i) => `<button class="choice" data-action="shrine-pick" data-idx="${i}">
          <span style="font-size:24px">${op.icon}</span>
          <span><span class="cn">${esc(op.name)}</span><span class="cd">${esc(op.desc)}</span></span>
          <span class="arrow">→</span>
        </button>`).join("")}
      </div>
      <p class="center tiny muted mt-3">Solo puedes recibir un don.</p>
    </div>`;
  };

  U.actions["shrine-pick"] = (ds) => {
    const g = RPG.game;
    if (!g) return;
    E.shrineChoose(g, Number(ds.idx));
    U.render();
  };

  /* ---------------- final ---------------- */
  U.renderEnd = function (g) {
    const victory = !!g.victory;
    const score = g.score || E.score(g);
    const meta = E.getMeta();
    const b = g.build;
    const cls = D.byId.classes[b.classId];
    const scen = D.byId.scenarios[b.scenarioId];
    const theme = D.byId.themes[b.themeId];
    const diff = D.byId.difficulties[b.difficultyId];
    const len = D.byId.lengths[b.lengthId];
    const comp = D.byId.companions[b.companionId];
    const patron = D.byId.patrons[b.patronId];
    const best = score >= meta.bestScore;
    return `<div class="end-screen ${victory ? "" : "defeat"} screen-narrow">
      <span class="end-sigil">${victory ? "👑" : g.abandoned ? "🏳️" : "☠️"}</span>
      <div class="eyebrow">${victory ? "Expedición completada" : g.abandoned ? "Expedición abandonada" : "La expedición termina aquí"}</div>
      <h1 class="${victory ? "title-gradient" : ""}">${victory ? "El Umbral se abre" : "Has caído"}</h1>
      <p class="subtitle">${victory
        ? `${esc(g.player.name)} ha derrotado al jefe final. Su nombre será recordado en las crónicas.`
        : `${esc(g.player.name)} no logró completar la expedición. El umbral espera a otro héroe.`}</p>
      <div class="end-stats">
        <div class="end-stat"><b>${score}</b><span>Puntuación${best && score > 0 ? " · ¡récord!" : ""}</span></div>
        <div class="end-stat"><b>${g.player.level}</b><span>Nivel</span></div>
        <div class="end-stat"><b>${g.stats.kills}</b><span>Enemigos</span></div>
        <div class="end-stat"><b>${g.stats.nodes}</b><span>Etapas</span></div>
        <div class="end-stat"><b>${g.stats.goldEarned}</b><span>Oro ganado</span></div>
        <div class="end-stat"><b>${g.stats.potionsUsed}</b><span>Pociones</span></div>
      </div>
      <div class="panel panel-flat" style="text-align:left">
        <div class="summary-list">
          <div><span>Clase</span><b>${cls.icon} ${esc(cls.name)}</b></div>
          <div><span>Escenario</span><b>${scen.icon} ${esc(scen.name)}</b></div>
          <div><span>Enemigos</span><b>${theme.icon} ${esc(theme.name)}</b></div>
          <div><span>Dificultad</span><b>${diff.icon} ${esc(diff.name)}</b></div>
          <div><span>Duración</span><b>${len.icon} ${esc(len.name)}</b></div>
          <div><span>Compañero</span><b>${comp.icon} ${esc(comp.name)}</b></div>
          <div><span>Patrón</span><b>${patron.icon} ${esc(patron.name)}</b></div>
          ${(b.curseIds || []).length ? `<div><span>Maldiciones</span><b class="curse">${b.curseIds.map(id => D.byId.curses[id].name).join(", ")}</b></div>` : ""}
        </div>
        <div class="divider-label">Reliquias</div>
        <div class="chip-row">${U.relicChips(g.player.relicIds)}</div>
      </div>
      <div class="row-wrap center mt-3" style="justify-content:center">
        <button class="btn btn-primary" data-action="rematch">🔁 Repetir con esta build</button>
        <button class="btn" data-action="new-run">🛠️ Nueva expedición</button>
        <button class="btn btn-ghost" data-action="new-random">🎲 Aleatoria</button>
        <button class="btn btn-ghost" data-action="back-to-menu">🏠 Menú</button>
      </div>
      <p class="tiny muted mt-3">Mejor puntuación: ${meta.bestScore} · Partidas jugadas: ${meta.runs} · Victorias: ${meta.victories}</p>
    </div>`;
  };

  U.actions["rematch"] = () => {
    const g = RPG.game;
    if (!g) return;
    const build = JSON.parse(JSON.stringify(g.build));
    E.newGame(build, g.player.name, g.mode || "custom");
    U.mode = null;
    U.targeting = null;
    U.modal = null;
    U.render();
  };
})();

/* ============================================================
   Crónicas del Umbral — motor: combate por turnos
   ============================================================ */
(function () {
  "use strict";
  const RPG = (globalThis.RPG = globalThis.RPG || {});
  const D = RPG.data;
  const E = RPG.engine;
  const H = E._;
  const clamp = H.clamp;

  const MIT = (def) => 30 / (30 + Math.max(0, def) * 1.5);
  const variance = (r) => 0.9 + r.next() * 0.2;
  const alive = (c) => c.enemies.filter(e => e.hp > 0);

  function logC(c, text, cls) {
    c.log.push({ text, cls: cls || "" });
    if (c.log.length > 60) c.log.shift();
  }
  function stName(id) { return (D.statuses[id] && D.statuses[id].name) || id; }
  function stIcon(id) { return (D.statuses[id] && D.statuses[id].icon) || "•"; }
  function getStatus(actor, id) {
    return (actor.statuses || []).find(s => s.id === id) || null;
  }
  function hasStatus(actor, id) { return !!getStatus(actor, id); }
  function removeStatus(actor, id) {
    const arr = actor.statuses || [];
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i].id === id) arr.splice(i, 1);
  }
  function addStatus(actor, id, turns, value) {
    if (!actor.statuses) actor.statuses = [];
    const ex = actor.statuses.find(s => s.id === id);
    if (ex) {
      ex.turns = Math.max(ex.turns, turns);
      ex.value = Math.max(ex.value || 0, value || 0);
    } else {
      actor.statuses.push({ id, turns, value: value || 0 });
    }
  }
  const DEBUFFS = ["weak", "vulnerable", "mark", "slow", "burn", "poison", "bleed", "stun"];
  function hasDebuff(actor) { return (actor.statuses || []).some(s => DEBUFFS.includes(s.id)); }
  function decay(actor) {
    if (!actor.statuses) return;
    for (const s of actor.statuses) s.turns--;
    const kept = actor.statuses.filter(s => s.turns > 0);
    actor.statuses.length = 0;
    for (const s of kept) actor.statuses.push(s);
  }

  function addEnergy(g, amount) {
    const s = E.stats(g);
    g.player.energy = clamp((g.player.energy || 0) + amount, 0, s.resMax);
  }

  /* ---------------- creación de enemigos ---------------- */
  function pickBase(g, tier, exclude) {
    const r = H.getRng(g);
    const theme = g.build.themeId;
    const scen = D.byId.scenarios[g.build.scenarioId];
    const boost = scen ? scen.themeBoost : null;
    let pool;
    if (tier === "boss") {
      pool = D.enemies.filter(e => e.tier === "boss");
      if (theme !== "mixed") {
        const themed = pool.filter(e => e.theme === theme);
        if (themed.length) pool = themed;
      }
    } else {
      pool = D.enemies.filter(e => e.tier === tier);
      if (theme !== "mixed") {
        const themed = pool.filter(e => e.theme === theme);
        if (themed.length) pool = themed;
      }
    }
    let avail = pool.filter(e => !exclude.includes(e.id));
    if (!avail.length) avail = pool;
    return r.weighted(avail, e => (theme === "mixed" && e.theme === boost ? 2.2 : 1));
  }

  function chooseIntent(enemy) {
    const pool = enemy.intents || [];
    if (!pool.length) return { name: "Golpe", icon: "🗡️", type: "attack", mult: 1, w: 1 };
    const r = H.getRng(RPG.game);
    let avail = pool.filter(i => !enemy.intent || i.name !== enemy.intent.name);
    if (!avail.length) avail = pool;
    return Object.assign({}, r.weighted(avail, i => i.w || 1));
  }

  function makeEnemy(g, base, opts) {
    const stage = g.stageIndex + 1;
    const len = D.byId.lengths[g.build.lengthId];
    const diff = D.byId.difficulties[g.build.difficultyId];
    const s = E.stats(g);
    const r = H.getRng(g);
    let hp = base.hp * (1 + (stage - 1) * 0.1);
    let atk = base.atk * (1 + (stage - 1) * 0.07);
    hp *= diff.enemyHp;
    atk *= s.enemyAtkMult * diff.enemyAtk;
    if (base.tier === "boss") {
      const lm = { escaramuza: 0.68, aventura: 1, campana: 1.05 }[len.id] || 1;
      hp *= lm * 0.85 * (1 + (stage - 1) * 0.02);
      atk *= 0.95;
    }
    if (opts.count >= 3) atk *= 0.8;
    if (base.tier === "elite" && opts.extra) atk *= 0.9;
    hp = Math.max(10, Math.round(hp));
    atk = Math.max(2, Math.round(atk * 10) / 10);
    const traits = Object.assign({}, base.traits || {});
    const intents = (D.roles[base.role] || []).concat(base.signature ? [base.signature] : []);
    const enemy = {
      uid: H.uid(),
      id: base.id, name: base.name, icon: base.icon, theme: base.theme, tier: base.tier,
      role: base.role, desc: base.desc || "",
      hp, maxHp: hp, atk, def: base.def || 0,
      statuses: [], shield: traits.shieldStart || 0,
      intents, intent: null, traits,
      baseXp: base.xp || 10, baseGold: base.gold || 6,
      enraged: false
    };
    const amb = s.ambush || 0;
    if (amb > 0) enemy.hp = enemy.maxHp = Math.max(1, Math.round(hp * (1 - amb)));
    enemy.intent = chooseIntent(enemy);
    return enemy;
  }

  E.startCombat = function (g, tier, opts) {
    opts = opts || {};
    g.pending = null;
    const r = H.getRng(g);
    const stage = g.stageIndex + 1;
    const s = E.stats(g);
    const countBase = (() => {
      if (tier === "boss") return 1;
      if (tier === "elite") return stage >= 8 && r.chance(0.35) ? 2 : 1;
      if (stage <= 2) return r.chance(0.28) ? 2 : 1;
      if (stage <= 6) return r.chance(0.55) ? 2 : 1;
      return r.chance(0.2) ? 3 : 2;
    })();
    const used = [];
    const enemies = [];
    for (let i = 0; i < countBase; i++) {
      const isExtra = i > 0;
      let base;
      if (isExtra && tier === "elite") {
        base = pickBase(g, "normal", used);
      } else {
        base = pickBase(g, tier, used);
      }
      used.push(base.id);
      enemies.push(makeEnemy(g, base, { count: countBase, extra: isExtra }));
    }
    const c = {
      tier,
      round: 1,
      turn: "player",
      enemies,
      playerStatuses: [],
      shield: 0,
      log: [],
      companionCd: (D.byId.companions[g.build.companionId] || {}).every || 99,
      firstAttackUsed: false,
      firstEnemyAttack: true,
      bonus: opts.bonus || {},
      kills: 0,
      dealt: 0,
      taken: 0
    };
    g.combat = c;
    g.player.energy = s.resStart;
    g.screen = "combat";
    const scen = D.byId.scenarios[g.build.scenarioId];
    if (s.startPoison && scen && scen.mods && scen.mods.startPoison) {
      addStatus({ statuses: c.playerStatuses }, "poison", 2, scen.mods.startPoison);
    }
    if (s.startShield) c.shield = s.startShield;
    const label = tier === "boss" ? "¡El jefe final aparece!" : tier === "elite" ? "Un enemigo élite bloquea tu camino." : "El combate comienza.";
    logC(c, label, "sys");
    if (tier === "boss") {
      logC(c, enemies[0].desc, "sys");
      g.player.energy = s.resMax;
      g.player.hp = Math.max(g.player.hp, Math.round(s.maxHp * 0.35));
      logC(c, "Recuperas el aliento antes del enfrentamiento final.", "good");
    }
    beginPlayerTurn(g, true);
    E.save(g);
  };

  /* ---------------- turnos ---------------- */
  function tickPlayer(g, events) {
    const c = g.combat;
    if (!c) return;
    const s = E.stats(g);
    if (s.regenPerTurn) {
      const healed = E.healPlayer(g, s.maxHp * s.regenPerTurn);
      if (healed > 0) { logC(c, `Regeneras ${healed} de vida.`, "good"); events.push({ type: "heal", side: "player", amount: healed }); }
    }
    for (const st of c.playerStatuses.slice()) {
      if (st.id === "burn" || st.id === "poison" || st.id === "bleed") {
        g.player.hp -= st.value;
        g.stats.damageTaken += st.value;
        logC(c, `${stIcon(st.id)} ${stName(st.id)} te causa ${st.value} de daño.`, "bad");
        events.push({ type: "dmg", side: "player", amount: st.value, dot: true });
      } else if (st.id === "regen") {
        const healed = E.healPlayer(g, st.value);
        if (healed > 0) {
          logC(c, `💚 Regeneración te cura ${healed}.`, "good");
          events.push({ type: "heal", side: "player", amount: healed });
        }
      }
    }
    if (g.player.hp <= 0) checkDeath(g, events);
  }

  function beginPlayerTurn(g, first, events) {
    const c = g.combat;
    if (!c || g.finished) return;
    c.turn = "player";
    const s = E.stats(g);
    addEnergy(g, s.resRegen);
    if (!first) c.shield = 0;
    tickPlayer(g, events || []);
    if (!g.finished) logC(c, `— Ronda ${c.round} —`, "sys");
  }

  function checkDeath(g, events) {
    if (g.player.hp > 0) return false;
    const s = E.stats(g);
    const maxRev = Math.max(0, s.revive || 0);
    if (g.player.revivesUsed < maxRev) {
      g.player.revivesUsed++;
      g.player.hp = Math.max(1, Math.round(s.maxHp * 0.35));
      g.combat.shield = 0;
      logC(g.combat, "✨ Una fuerza antigua te devuelve a la vida. ¡Renaces con el 35% de tu vida!", "crit");
      events.push({ type: "heal", side: "player", amount: g.player.hp, revive: true });
      return false;
    }
    logC(g.combat, "☠️ Caes en combate...", "bad");
    E.finishRun(g, false);
    return true;
  }

  /* ---------------- daño ---------------- */
  function killEnemy(g, enemy, events) {
    if (enemy.hp > 0 || enemy._dead) return;
    enemy._dead = true;
    g.stats.kills++;
    g.combat.kills++;
    logC(g.combat, `${enemy.icon} ${enemy.name} cae derrotado.`, "good");
    events.push({ type: "die", uid: enemy.uid });
  }

  function enrageCheck(g, enemy, events) {
    const c = g.combat;
    if (enemy.hp <= 0 || enemy.enraged) return;
    if ((enemy.traits.phase || enemy.traits.enrage) && enemy.hp / enemy.maxHp <= 0.5) {
      enemy.enraged = true;
      addStatus(enemy, "strength", 99, enemy.traits.phase ? 25 : 20);
      logC(c, `${enemy.icon} ${enemy.name} se enfurece. Su poder aumenta.`, "bad");
      events.push({ type: "buff", uid: enemy.uid });
    }
  }

  function playerHit(g, enemy, opts, events) {
    const c = g.combat;
    if (!c || !enemy || enemy.hp <= 0) return 0;
    const s = E.stats(g);
    const r = H.getRng(g);
    if (enemy.statuses.some(st => st.id === "dodge")) {
      removeStatus(enemy, "dodge");
      logC(c, `${enemy.name} esquiva el ataque.`, "bad");
      events.push({ type: "miss", uid: enemy.uid });
      return 0;
    }
    let base = s.atk * (opts.mult || 1);
    const str = getStatus({ statuses: c.playerStatuses }, "strength");
    if (str) base *= 1 + str.value / 100;
    if (hasStatus({ statuses: c.playerStatuses }, "weak")) base *= 0.75;
    if (hasStatus({ statuses: c.playerStatuses }, "slow")) base *= 0.8;
    base *= s.dmgMult;
    if (opts.skill) base *= 1 + (s.skillDmg || 0);
    if (g.player.hp / s.maxHp < 0.4) base *= 1 + (s.lowHpDmg || 0);
    if (s.debuffDmg && hasDebuff(enemy)) base *= 1 + s.debuffDmg;
    if (s.dmgSingle && alive(c).length === 1) base *= 1 + s.dmgSingle;
    if (s.firstStrike && !c.firstAttackUsed) base *= 1 + s.firstStrike;
    if (s.execute && enemy.hp / enemy.maxHp < 0.3) base *= 1 + s.execute;
    if (opts.execute && enemy.hp / enemy.maxHp < 0.4) base *= 1.5;
    if (hasStatus(enemy, "vulnerable")) base *= 1.3;
    if (hasStatus(enemy, "mark")) base *= 1.25;
    base *= variance(r);
    let crit = false;
    if (r.next() < s.crit + (opts.bonusCrit || 0)) { crit = true; base *= s.critDmg; }
    const res = enemy.traits.resist && enemy.traits.resist[opts.element || "physical"];
    if (res) base *= 1 - res;
    base *= MIT(enemy.def);
    let dmg = Math.max(1, Math.round(base));
    let blocked = 0;
    if (enemy.shield > 0) {
      blocked = Math.min(enemy.shield, dmg);
      enemy.shield -= blocked;
      dmg -= blocked;
    }
    if (dmg > 0) { enemy.hp -= dmg; c.dealt += dmg; g.stats.damageDealt += dmg; }
    events.push({ type: "dmg", side: "enemy", uid: enemy.uid, amount: dmg, crit, blocked });
    logC(c, `${crit ? "¡CRÍTICO! " : ""}${enemy.name} recibe ${dmg} de daño${blocked ? ` (${blocked} bloqueado)` : ""}.`, crit ? "crit" : "");
    const steal = (s.lifesteal || 0) + (opts.lifesteal || 0);
    if (steal > 0 && dmg > 0) {
      const healed = E.healPlayer(g, dmg * steal);
      if (healed > 0) {
        logC(c, `🩸 Robas ${healed} de vida.`, "good");
        events.push({ type: "heal", side: "player", amount: healed });
      }
    }
    if (dmg > 0 && enemy.traits.thorns) {
      const t = enemy.traits.thorns;
      g.player.hp -= t;
      g.stats.damageTaken += t;
      logC(c, `🌵 ${enemy.name} te devuelve ${t} de daño.`, "bad");
      events.push({ type: "dmg", side: "player", amount: t });
      if (g.player.hp <= 0) checkDeath(g, events);
    }
    if (enemy.hp <= 0) killEnemy(g, enemy, events);
    else enrageCheck(g, enemy, events);
    return dmg;
  }

  function hitPlayer(g, raw, events, opts) {
    const c = g.combat;
    const s = E.stats(g);
    const fort = getStatus({ statuses: c.playerStatuses }, "fortify");
    const def = s.def * (1 + (fort ? fort.value / 100 : 0));
    let dmg = raw * MIT(def);
    if (hasStatus({ statuses: c.playerStatuses }, "vulnerable")) dmg *= 1.3;
    if (hasStatus({ statuses: c.playerStatuses }, "mark")) dmg *= 1.25;
    dmg *= s.dmgTakenMult;
    dmg = Math.max(1, Math.round(dmg));
    let absorbed = 0;
    if (c.shield > 0) {
      absorbed = Math.min(c.shield, dmg);
      c.shield -= absorbed;
      dmg -= absorbed;
    }
    if (dmg > 0) {
      g.player.hp -= dmg;
      g.stats.damageTaken += dmg;
      c.taken += dmg;
    }
    events.push({ type: "dmg", side: "player", amount: dmg, absorbed });
    if (dmg > 0) logC(c, `Recibes ${dmg} de daño${absorbed ? ` (${absorbed} absorbido)` : ""}.`, "bad");
    else logC(c, `Tu escudo absorbe el golpe (${absorbed}).`, "sys");
    const cls = D.byId.classes[g.player.classId];
    if (cls.res.takeGain && (dmg > 0 || absorbed > 0)) addEnergy(g, cls.res.takeGain);
    if (g.player.hp <= 0) checkDeath(g, events);
    return dmg;
  }

  /* ---------------- acciones del jugador ---------------- */
  function finishAction(g, events) {
    const c = g.combat;
    if (!c || g.finished) return events;
    if (alive(c).length === 0) {
      onCombatWin(g, events);
      return events;
    }
    companionAct(g, events);
    if (g.finished || !g.combat) return events;
    if (alive(c).length === 0) { onCombatWin(g, events); return events; }
    enemyPhase(g, events);
    if (g.finished || !g.combat) return events;
    decay({ statuses: c.playerStatuses });
    c.round++;
    c.firstAttackUsed = true;
    beginPlayerTurn(g, false, events);
    E.save(g);
    return events;
  }

  function doAttack(g, targetUid, events) {
    const c = g.combat;
    const enemies = alive(c);
    if (!enemies.length) return;
    const target = enemies.find(e => e.uid === targetUid) || enemies[0];
    c.firstAttackUsed = true;
    logC(c, `Atacas a ${target.name}.`, "");
    playerHit(g, target, { mult: 1.0, element: "physical" }, events);
    const cls = D.byId.classes[g.player.classId];
    addEnergy(g, cls.res.basicGain || 8);
  }

  function skillCost(g, skill) {
    return Math.max(1, Math.round(skill.cost * E.stats(g).skillCostMult));
  }

  function doSkill(g, skillId, targetUid, events) {
    const c = g.combat;
    const cls = D.byId.classes[g.player.classId];
    const skill = (cls.skills || []).find(k => k.id === skillId);
    if (!skill) return false;
    const cost = skillCost(g, skill);
    if (g.player.energy < cost) return false;
    const enemies = alive(c);
    if (!enemies.length) return false;
    let target = enemies.find(e => e.uid === targetUid) || enemies[0];
    g.player.energy -= cost;
    c.firstAttackUsed = true;
    logC(c, `Usas ${skill.name}.`, "sys");
    for (const op of skill.ops) {
      if (op.t === "dmg") {
        const list = op.all ? alive(c) : [target];
        for (const en of list) {
          if (en.hp <= 0) continue;
          playerHit(g, en, {
            mult: op.mult, element: op.element || "physical", skill: true,
            bonusCrit: op.bonusCrit, execute: op.execute, lifesteal: op.lifesteal
          }, events);
        }
      } else if (op.t === "status") {
        const turns = op.turns || 2;
        const value = op.value || 0;
        if (op.to === "self") {
          addStatus({ statuses: c.playerStatuses }, op.id, turns, value);
          logC(c, `Ganas ${stIcon(op.id)} ${stName(op.id)}.`, "good");
        } else {
          const list = op.to === "all" ? alive(c) : [target];
          for (const en of list) {
            addStatus(en, op.id, turns, value);
            events.push({ type: "status", uid: en.uid, status: op.id });
          }
          logC(c, `${stIcon(op.id)} ${stName(op.id)} afecta al enemigo.`, "sys");
        }
      } else if (op.t === "heal") {
        const amount = op.pct != null ? E.stats(g).maxHp * op.pct : (op.flat || 0);
        const healed = E.healPlayer(g, amount);
        logC(c, `💚 Te curas ${healed}.`, "good");
        events.push({ type: "heal", side: "player", amount: healed });
      } else if (op.t === "shield") {
        c.shield += op.value || 0;
        logC(c, `🛡️ Ganas ${op.value} de escudo.`, "good");
        events.push({ type: "shield", side: "player", amount: op.value });
      } else if (op.t === "resource") {
        addEnergy(g, op.value || 0);
        events.push({ type: "energy", amount: op.value || 0 });
      } else if (op.t === "cleanse") {
        const count = op.count || 1;
        let removed = 0;
        for (const id of ["burn", "poison", "bleed", "weak", "vulnerable", "mark", "slow"]) {
          if (removed >= count) break;
          if (hasStatus({ statuses: c.playerStatuses }, id)) { removeStatus({ statuses: c.playerStatuses }, id); removed++; }
        }
        if (removed) logC(c, "💧 Eliminas un efecto negativo.", "good");
      }
    }
    return true;
  }

  function doDefend(g, events) {
    const c = g.combat;
    const s = E.stats(g);
    const block = 8 + Math.round(s.def * 0.6);
    c.shield += block;
    addEnergy(g, 10);
    logC(c, `🛡️ Te pones en guardia y ganas ${block} de escudo.`, "good");
    events.push({ type: "shield", side: "player", amount: block });
  }

  function doPotion(g, potionId, events) {
    const c = g.combat;
    if (!E.potionCount(g, potionId)) return false;
    const po = D.byId.potions[potionId];
    if (!po) return false;
    E.removePotion(g, potionId, 1);
    g.stats.potionsUsed++;
    logC(c, `Usas ${po.name}.`, "sys");
    const ef = po.effect;
    if (ef.type === "heal") {
      const healed = E.healPlayer(g, E.stats(g).maxHp * ef.pct);
      logC(c, `💚 Te curas ${healed}.`, "good");
      events.push({ type: "heal", side: "player", amount: healed });
    } else if (ef.type === "resource") {
      addEnergy(g, ef.value);
      logC(c, `💠 Recuperas ${ef.value} de recurso.`, "good");
    } else if (ef.type === "cleanseHeal") {
      const holder = { statuses: c.playerStatuses };
      holder.statuses = holder.statuses.filter(s => !DEBUFFS.includes(s.id));
      c.playerStatuses = holder.statuses;
      const healed = E.healPlayer(g, E.stats(g).maxHp * 0.1);
      logC(c, `💧 Te purificas y recuperas ${healed} de vida.`, "good");
      events.push({ type: "heal", side: "player", amount: healed });
    } else if (ef.type === "status") {
      addStatus({ statuses: c.playerStatuses }, ef.status.id, ef.status.turns, ef.status.value);
      logC(c, `${stIcon(ef.status.id)} Ganas ${stName(ef.status.id)}.`, "good");
    } else if (ef.type === "bomb") {
      for (const en of alive(c)) {
        en.hp -= ef.value;
        events.push({ type: "dmg", side: "enemy", uid: en.uid, amount: ef.value });
        logC(c, `💣 ${en.name} recibe ${ef.value} de daño.`, "");
        if (en.hp <= 0) killEnemy(g, en, events);
      }
    } else if (ef.type === "shield") {
      c.shield += ef.value;
      logC(c, `🛡️ Ganas ${ef.value} de escudo.`, "good");
      events.push({ type: "shield", side: "player", amount: ef.value });
    }
    return true;
  }

  function doFlee(g, events) {
    const c = g.combat;
    if (c.tier === "boss") {
      logC(c, "No puedes huir del jefe final.", "bad");
      return false;
    }
    const chance = c.tier === "elite" ? 0.35 : 0.55;
    const r = H.getRng(g);
    if (r.next() < chance) {
      g.stats.fled++;
      logC(c, "Logras escapar del combate.", "sys");
      g.combat = null;
      E.finishNode(g);
      return true;
    }
    logC(c, "No logras escapar.", "bad");
    return true;
  }

  E.combatAction = function (g, action, data) {
    data = data || {};
    const c = g.combat;
    const events = [];
    if (!c || g.finished || c.turn !== "player") return events;
    let ok = false;
    if (action === "attack") { doAttack(g, data.targetUid, events); ok = true; }
    else if (action === "skill") { ok = doSkill(g, data.skillId, data.targetUid, events); }
    else if (action === "defend") { doDefend(g, events); ok = true; }
    else if (action === "potion") { ok = doPotion(g, data.potionId, events); }
    else if (action === "flee") { ok = doFlee(g, events); }
    if (!ok) return events;
    if (g.finished) return events;
    if (action === "flee" && !g.combat) return events;
    return finishAction(g, events);
  };

  /* ---------------- compañero ---------------- */
  function companionAct(g, events) {
    const comp = D.byId.companions[g.build.companionId];
    const c = g.combat;
    if (!comp || comp.id === "ninguno" || !c) return;
    c.companionCd = (c.companionCd == null ? comp.every : c.companionCd) - 1;
    if (c.companionCd > 0) return;
    c.companionCd = comp.every;
    const a = comp.action || {};
    const enemies = alive(c);
    if (!enemies.length) return;
    if (a.type === "damage") {
      const target = a.target === "lowest"
        ? enemies.reduce((x, y) => (x.hp <= y.hp ? x : y))
        : enemies.reduce((x, y) => (x.hp >= y.hp ? x : y));
      logC(c, `${comp.icon} ${comp.name} ataca a ${target.name}.`, "good");
      playerHit(g, target, { mult: a.mult || 1, element: "physical" }, events);
    } else if (a.type === "heal") {
      const healed = E.healPlayer(g, E.stats(g).maxHp * (a.pct || 0.08));
      if (healed > 0) {
        logC(c, `${comp.icon} ${comp.name} te cura ${healed}.`, "good");
        events.push({ type: "heal", side: "player", amount: healed });
      }
    } else if (a.type === "shield") {
      c.shield += a.value || 8;
      logC(c, `${comp.icon} ${comp.name} te otorga ${a.value || 8} de escudo.`, "good");
      events.push({ type: "shield", side: "player", amount: a.value || 8 });
    } else if (a.type === "status") {
      const target = a.target === "strongest"
        ? enemies.reduce((x, y) => (x.atk >= y.atk ? x : y))
        : enemies[0];
      addStatus(target, a.status.id, a.status.turns || 2, a.status.value || 0);
      logC(c, `${comp.icon} ${comp.name} ${stIcon(a.status.id)} marca a ${target.name}.`, "good");
      events.push({ type: "status", uid: target.uid, status: a.status.id });
    }
  }

  /* ---------------- fase enemiga ---------------- */
  function applyStatusToPlayer(g, status, events) {
    const c = g.combat;
    let id = status.id;
    let turns = status.turns || 2;
    const value = status.value || 0;
    if (id === "stun") {
      id = "slow";
      turns = Math.max(2, turns + 1);
      logC(c, "💫 El impacto te tambalea.", "bad");
    }
    addStatus({ statuses: c.playerStatuses }, id, turns, value);
    logC(c, `${stIcon(id)} Sufres ${stName(id)}.`, "bad");
    events.push({ type: "status", side: "player", status: id });
  }

  function healEnemy(g, enemy, amount, events) {
    const before = enemy.hp;
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.max(0, Math.round(amount)));
    const healed = enemy.hp - before;
    if (healed > 0) {
      logC(g.combat, `${enemy.name} se cura ${healed}.`, "bad");
      events.push({ type: "heal", side: "enemy", uid: enemy.uid, amount: healed });
    }
    return healed;
  }

  function enemyAct(g, enemy, events) {
    const c = g.combat;
    const r = H.getRng(g);
    if (!enemy || enemy.hp <= 0 || g.finished) return;

    if (enemy.traits.regen) {
      const before = enemy.hp;
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.traits.regen);
      if (enemy.hp > before) logC(c, `${enemy.name} regenera ${enemy.hp - before}.`, "bad");
    }
    for (const st of enemy.statuses.slice()) {
      if (st.id === "burn" || st.id === "poison" || st.id === "bleed") {
        enemy.hp -= st.value;
        logC(c, `${stIcon(st.id)} ${enemy.name} sufre ${st.value} de daño.`, "good");
        events.push({ type: "dmg", side: "enemy", uid: enemy.uid, amount: st.value, dot: true });
      } else if (st.id === "regen") {
        healEnemy(g, enemy, st.value, events);
      }
    }
    if (enemy.hp <= 0) { killEnemy(g, enemy, events); return; }

    if (getStatus(enemy, "stun")) {
      logC(c, `💫 ${enemy.name} está aturdido y pierde su turno.`, "good");
      decay(enemy);
      enemy.intent = chooseIntent(enemy);
      return;
    }

    const intent = enemy.intent || chooseIntent(enemy);
    const str = getStatus(enemy, "strength");
    const forti = getStatus(enemy, "fortify");
    let atk = enemy.atk;
    if (str) atk *= 1 + str.value / 100;
    if (hasStatus(enemy, "weak")) atk *= 0.75;
    if (hasStatus(enemy, "slow")) atk *= 0.8;

    if (intent.type === "attack" || intent.type === "drain") {
      const hits = intent.hits || 1;
      let total = 0;
      let missedAll = true;
      for (let i = 0; i < hits; i++) {
        if (g.finished) return;
        if (c.firstEnemyAttack && E.stats(g).firstDodge) {
          c.firstEnemyAttack = false;
          logC(c, `👢 Esquivas el primer ataque de ${enemy.name}.`, "good");
          events.push({ type: "miss", side: "player" });
          continue;
        }
        c.firstEnemyAttack = false;
        if (hasStatus({ statuses: c.playerStatuses }, "dodge")) {
          removeStatus({ statuses: c.playerStatuses }, "dodge");
          logC(c, `💨 Esquivas el ataque de ${enemy.name}.`, "good");
          events.push({ type: "miss", side: "player" });
          continue;
        }
        missedAll = false;
        let raw = atk * (intent.mult || 1) * variance(r);
        total += hitPlayer(g, raw, events);
        if (g.finished) return;
      }
      if (intent.status && !missedAll) {
        const chance = intent.status.chance == null ? 1 : intent.status.chance;
        if (r.next() < chance) applyStatusToPlayer(g, intent.status, events);
      }
      if (intent.type === "drain" && total > 0) {
        healEnemy(g, enemy, total * (intent.healPct || 0.5), events);
      }
      if (enemy.traits.lifesteal && total > 0) {
        healEnemy(g, enemy, total * enemy.traits.lifesteal, events);
      }
      logC(c, `${enemy.icon} ${enemy.name} usa ${intent.name}.`, "");
    } else if (intent.type === "debuff") {
      logC(c, `${enemy.icon} ${enemy.name} usa ${intent.name}.`, "");
      applyStatusToPlayer(g, intent.status || { id: "weak", turns: 2 }, events);
    } else if (intent.type === "buff") {
      const st = Object.assign({}, intent.status || { id: "strength", turns: 3, value: 20 });
      if (st.id === "dodge") st.turns = Math.max(2, st.turns || 1);
      addStatus(enemy, st.id, st.turns || 2, st.value || 0);
      logC(c, `${enemy.icon} ${enemy.name} gana ${stIcon(st.id)} ${stName(st.id)}.`, "bad");
      events.push({ type: "buff", uid: enemy.uid });
      logC(c, `${enemy.icon} ${enemy.name} usa ${intent.name}.`, "");
    } else if (intent.type === "buffAlly") {
      const allies = alive(c);
      const target = allies.reduce((x, y) => (x.atk >= y.atk ? x : y), allies[0]);
      const st = intent.status || { id: "strength", turns: 3, value: 20 };
      if (target) {
        addStatus(target, st.id, st.turns || 2, st.value || 0);
        logC(c, `${enemy.name} fortalece a ${target.name}.`, "bad");
        events.push({ type: "buff", uid: target.uid });
      }
    } else if (intent.type === "defend") {
      enemy.shield += intent.shield || 10;
      logC(c, `${enemy.icon} ${enemy.name} se protege con ${intent.shield || 10} de escudo.`, "bad");
      events.push({ type: "shield", side: "enemy", uid: enemy.uid, amount: intent.shield || 10 });
    } else if (intent.type === "heal") {
      const allies = alive(c);
      const target = allies.reduce((x, y) => (x.hp / x.maxHp <= y.hp / y.maxHp ? x : y), allies[0]);
      if (target) healEnemy(g, target, target.maxHp * (intent.healPct || 0.2), events);
    } else {
      let raw = atk * (intent.mult || 1) * variance(r);
      hitPlayer(g, raw, events);
    }

    if (g.finished) return;
    if (intent.type === "defend" || intent.type === "buff" || intent.type === "buffAlly" || intent.type === "heal" || intent.type === "debuff") {
      // los efectos ya se aplicaron
    }
    decay(enemy);
    enemy.intent = chooseIntent(enemy);
  }

  function enemyPhase(g, events) {
    const c = g.combat;
    if (!c) return;
    for (const enemy of c.enemies.slice()) {
      if (g.finished || !g.combat) return;
      if (enemy.hp <= 0) continue;
      logC(c, `Turno de ${enemy.name}.`, "sys");
      enemyAct(g, enemy, events);
      if (g.finished) return;
      if (alive(c).length === 0) { onCombatWin(g, events); return; }
    }
  }

  /* ---------------- fin del combate ---------------- */
  function onCombatWin(g, events) {
    const c = g.combat;
    if (!c) return;
    logC(c, "¡Has ganado el combate!", "crit");
    if (c.tier === "boss") {
      g.log.push({ text: `Derrotas a ${c.enemies[0] ? c.enemies[0].name : "el jefe final"}.`, cls: "crit" });
      E.finishRun(g, true);
      return;
    }
    E.rewardScreen(g, c);
  }
})();

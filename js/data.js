/* ============================================================
   Crónicas del Umbral — datos del juego
   ============================================================ */
(function () {
  "use strict";
  const RPG = (globalThis.RPG = globalThis.RPG || {});
  const D = (RPG.data = {});

  /* ---------------- estados alterados ---------------- */
  D.statuses = {
    burn:      { name: "Quemadura",     icon: "🔥", kind: "dot",    desc: "Sufre daño al inicio de su turno." },
    poison:    { name: "Veneno",        icon: "☠️", kind: "dot",    desc: "Sufre daño que ignora la armadura." },
    bleed:     { name: "Sangrado",      icon: "🩸", kind: "dot",    desc: "Sufre daño al inicio de su turno." },
    regen:     { name: "Regeneración",  icon: "💚", kind: "hot",    desc: "Recupera vida al inicio de su turno." },
    strength:  { name: "Fuerza",        icon: "💪", kind: "buff",   desc: "Aumenta el daño infligido." },
    fortify:   { name: "Fortaleza",     icon: "🧱", kind: "buff",   desc: "Aumenta la defensa." },
    weak:      { name: "Debilidad",     icon: "📉", kind: "debuff", desc: "Reduce un 25% el daño infligido." },
    vulnerable:{ name: "Vulnerable",    icon: "🎯", kind: "debuff", desc: "Recibe un 30% más de daño." },
    mark:      { name: "Marcado",       icon: "🔻", kind: "debuff", desc: "Recibe un 25% más de daño." },
    slow:      { name: "Ralentizado",   icon: "🐌", kind: "debuff", desc: "Reduce un 20% el daño infligido." },
    dodge:     { name: "Evasión",       icon: "💨", kind: "buff",   desc: "Esquiva el próximo ataque." },
    stun:      { name: "Aturdido",      icon: "💫", kind: "debuff", desc: "Pierde su próximo turno." },
    enrage:    { name: "Enfurecido",    icon: "😡", kind: "buff",   desc: "La bestia se enfurece." }
  };

  /* ---------------- clases ---------------- */
  D.classes = [
    {
      id: "guerrero", name: "Guerrero", icon: "⚔️", color: "#c0392b",
      tagline: "Acero, furia y aguante",
      desc: "Un veterano de mil batallas. Golpea fuerte, aguanta más y se vuelve más peligroso cuanto más herido está.",
      hp: 78, atk: 8, def: 4, crit: 0.05, critDmg: 1.6,
      res: { id: "rage", name: "Furia", icon: "🔥", max: 100, start: 25, regen: 3, basicGain: 14, takeGain: 6 },
      passive: { name: "Ira Imparable", desc: "+25% de daño cuando estás por debajo del 40% de vida.", key: "lowHpDmg", value: 0.25 },
      skills: [
        { id: "tajo", name: "Tajo Brutal", icon: "🪓", cost: 30, target: "single",
          desc: "Un corte demoledor. 175% de daño.",
          ops: [{ t: "dmg", mult: 1.75, element: "physical" }] },
        { id: "grito", name: "Grito de Guerra", icon: "📢", cost: 22, target: "self",
          desc: "+20% de daño durante 3 turnos y 10 de escudo.",
          ops: [{ t: "status", id: "strength", turns: 3, value: 20, to: "self" }, { t: "shield", value: 10 }] },
        { id: "torbellino", name: "Torbellino", icon: "🌪️", cost: 40, target: "all",
          desc: "Golpea a todos los enemigos y provoca sangrado.",
          ops: [{ t: "dmg", mult: 1.05, all: true, element: "physical" },
                { t: "status", id: "bleed", turns: 2, value: 2, to: "all" }] },
        { id: "ejecucion", name: "Ejecución", icon: "💀", cost: 55, target: "single",
          desc: "260% de daño. Devastador contra enemigos heridos.",
          ops: [{ t: "dmg", mult: 2.6, element: "physical", execute: true }] }
      ]
    },
    {
      id: "mago", name: "Mago", icon: "🔮", color: "#7d5bd6",
      tagline: "Fuego, escarcha y conocimiento prohibido",
      desc: "Frágil pero devastador. Controla el campo con elementos y protege su vida con barreras arcanas.",
      hp: 54, atk: 7, def: 1, crit: 0.07, critDmg: 1.7,
      res: { id: "mana", name: "Maná", icon: "💠", max: 110, start: 70, regen: 12, basicGain: 6 },
      passive: { name: "Afinidad Arcana", desc: "+15% de daño con habilidades.", key: "skillDmg", value: 0.15 },
      skills: [
        { id: "bola", name: "Bola de Fuego", icon: "🔥", cost: 26, target: "single",
          desc: "155% de daño de fuego y quema al objetivo.",
          ops: [{ t: "dmg", mult: 1.55, element: "fire" },
                { t: "status", id: "burn", turns: 3, value: 4, to: "target" }] },
        { id: "escarcha", name: "Lanza de Escarcha", icon: "❄️", cost: 20, target: "single",
          desc: "125% de daño de hielo y ralentiza al objetivo.",
          ops: [{ t: "dmg", mult: 1.25, element: "ice" },
                { t: "status", id: "slow", turns: 2, value: 0, to: "target" }] },
        { id: "escudo", name: "Escudo Arcano", icon: "🛡️", cost: 22, target: "self",
          desc: "18 de escudo y regeneración durante 3 turnos.",
          ops: [{ t: "shield", value: 18 }, { t: "status", id: "regen", turns: 3, value: 3, to: "self" }] },
        { id: "nova", name: "Nova Arcana", icon: "💥", cost: 46, target: "all",
          desc: "Golpea a todos y los deja vulnerables.",
          ops: [{ t: "dmg", mult: 1.0, all: true, element: "arcane" },
                { t: "status", id: "vulnerable", turns: 2, value: 0, to: "all" }] }
      ]
    },
    {
      id: "arquero", name: "Arquero", icon: "🏹", color: "#3f8f5b",
      tagline: "Precisión letal a distancia",
      desc: "Cazador paciente y preciso. Marca a sus presas, las desangra y remata con disparos críticos.",
      hp: 62, atk: 8, def: 2, crit: 0.12, critDmg: 1.65,
      res: { id: "focus", name: "Puntería", icon: "🎯", max: 100, start: 50, regen: 10, basicGain: 12 },
      passive: { name: "Ojo de Halcón", desc: "+8% de probabilidad de crítico.", key: "crit", value: 0.08 },
      skills: [
        { id: "certero", name: "Disparo Certero", icon: "🎯", cost: 24, target: "single",
          desc: "155% de daño con +25% de crítico.",
          ops: [{ t: "dmg", mult: 1.55, element: "physical", bonusCrit: 0.25 }] },
        { id: "lluvia", name: "Lluvia de Flechas", icon: "🏹", cost: 34, target: "all",
          desc: "Daña a todos los enemigos y los hace sangrar.",
          ops: [{ t: "dmg", mult: 0.85, all: true, element: "physical" },
                { t: "status", id: "bleed", turns: 2, value: 2, to: "all" }] },
        { id: "marca", name: "Marca del Cazador", icon: "🔻", cost: 16, target: "single",
          desc: "Marca a un enemigo: recibe +25% de daño durante 3 turnos.",
          ops: [{ t: "dmg", mult: 0.5, element: "physical" },
                { t: "status", id: "mark", turns: 3, value: 0, to: "target" }] },
        { id: "paso", name: "Paso Sombrío", icon: "💨", cost: 18, target: "self",
          desc: "Esquiva el próximo ataque y recupera 12 de puntería.",
          ops: [{ t: "status", id: "dodge", turns: 1, value: 0, to: "self" }, { t: "resource", value: 12 }] }
      ]
    },
    {
      id: "picaro", name: "Pícaro", icon: "🗡️", color: "#8e6b2f",
      tagline: "Veneno, sombra y golpes sucios",
      desc: "Un asesino que no lucha limpio. Envenena, debilita y desaparece entre las sombras.",
      hp: 60, atk: 7, def: 2, crit: 0.15, critDmg: 1.9,
      res: { id: "energy", name: "Energía", icon: "⚡", max: 100, start: 60, regen: 12, basicGain: 10 },
      passive: { name: "Oportunista", desc: "+20% de daño contra enemigos con efectos negativos.", key: "debuffDmg", value: 0.20 },
      skills: [
        { id: "punalada", name: "Puñalada", icon: "🔪", cost: 20, target: "single",
          desc: "135% de daño y sangrado.",
          ops: [{ t: "dmg", mult: 1.35, element: "physical" },
                { t: "status", id: "bleed", turns: 2, value: 3, to: "target" }] },
        { id: "veneno", name: "Veneno Letal", icon: "☠️", cost: 24, target: "single",
          desc: "Aplica un veneno potente que ignora la armadura.",
          ops: [{ t: "dmg", mult: 0.7, element: "shadow" },
                { t: "status", id: "poison", turns: 4, value: 6, to: "target" }] },
        { id: "golpe", name: "Golpe Bajo", icon: "🦵", cost: 28, target: "single",
          desc: "Daña y debilita al enemigo durante 2 turnos.",
          ops: [{ t: "dmg", mult: 1.15, element: "physical" },
                { t: "status", id: "weak", turns: 2, value: 0, to: "target" }] },
        { id: "sombra", name: "Sombra", icon: "🌑", cost: 18, target: "self",
          desc: "Esquiva el próximo ataque y recupera 10 de energía.",
          ops: [{ t: "status", id: "dodge", turns: 1, value: 0, to: "self" }, { t: "resource", value: 10 }] }
      ]
    },
    {
      id: "clerigo", name: "Clérigo", icon: "✨", color: "#d4af37",
      tagline: "Luz, fe y castigo divino",
      desc: "Sanador resistente y castigador. Mantiene su vida alta y purga a los impíos con luz sagrada.",
      hp: 70, atk: 6, def: 3, crit: 0.05, critDmg: 1.5,
      res: { id: "faith", name: "Fe", icon: "🕯️", max: 110, start: 60, regen: 11, basicGain: 8 },
      passive: { name: "Fervor", desc: "+25% a todas las curaciones.", key: "healMult", value: 0.25 },
      skills: [
        { id: "luz", name: "Luz Curativa", icon: "💚", cost: 30, target: "self",
          desc: "Cura un 24% de tu vida máxima y elimina un efecto negativo.",
          ops: [{ t: "heal", pct: 0.24 }, { t: "cleanse", count: 1 }] },
        { id: "castigo", name: "Castigo Sagrado", icon: "🌟", cost: 24, target: "single",
          desc: "150% de daño sagrado y te cura 6.",
          ops: [{ t: "dmg", mult: 1.5, element: "holy" }, { t: "heal", flat: 6 }] },
        { id: "bendicion", name: "Bendición", icon: "🛡️", cost: 20, target: "self",
          desc: "12 de escudo y regeneración durante 3 turnos.",
          ops: [{ t: "shield", value: 12 }, { t: "status", id: "regen", turns: 3, value: 3, to: "self" }] },
        { id: "juicio", name: "Juicio", icon: "⚖️", cost: 42, target: "all",
          desc: "Golpea a todos con luz sagrada y los debilita.",
          ops: [{ t: "dmg", mult: 1.05, all: true, element: "holy" },
                { t: "status", id: "weak", turns: 2, value: 0, to: "all" }] }
      ]
    },
    {
      id: "druida", name: "Druida", icon: "🌿", color: "#4f8a3d",
      tagline: "Naturaleza indomable",
      desc: "Guardián del equilibrio. Se transforma, envenena y se regenera mientras la batalla se alarga.",
      hp: 66, atk: 6, def: 2, crit: 0.06, critDmg: 1.6,
      res: { id: "essence", name: "Esencia", icon: "🍃", max: 100, start: 55, regen: 10, basicGain: 10 },
      passive: { name: "Piel de Corteza", desc: "+2 de defensa permanente.", key: "def", value: 2 },
      skills: [
        { id: "forma", name: "Forma Salvaje", icon: "🐺", cost: 30, target: "self",
          desc: "+25% de daño y +20% de defensa durante 3 turnos.",
          ops: [{ t: "status", id: "strength", turns: 3, value: 25, to: "self" },
                { t: "status", id: "fortify", turns: 3, value: 20, to: "self" }] },
        { id: "zarzas", name: "Zarzas", icon: "🌵", cost: 24, target: "all",
          desc: "Daña a todos y los envenena.",
          ops: [{ t: "dmg", mult: 0.75, all: true, element: "nature" },
                { t: "status", id: "poison", turns: 3, value: 3, to: "all" }] },
        { id: "regeneracion", name: "Regeneración", icon: "💚", cost: 18, target: "self",
          desc: "Te curas 8 y ganas regeneración durante 3 turnos.",
          ops: [{ t: "heal", flat: 8 }, { t: "status", id: "regen", turns: 3, value: 6, to: "self" }] },
        { id: "colmillo", name: "Colmillo", icon: "🦷", cost: 26, target: "single",
          desc: "170% de daño y te curas un 40% del daño infligido.",
          ops: [{ t: "dmg", mult: 1.7, element: "nature", lifesteal: 0.4 }] }
      ]
    }
  ];

  /* ---------------- escenarios ---------------- */
  D.scenarios = [
    {
      id: "bosque", name: "Bosque Umbrío", icon: "🌲", themeBoost: "beast",
      desc: "Árboles milenarios ocultan bestias y espíritus. La maleza cura a quien la respeta.",
      greeting: "La niebla se cierne entre los árboles. Algo te observa desde la espesura.",
      mods: { healAfterCombat: 0.08 },
      tip: "Recuperas un 8% de vida tras cada combate."
    },
    {
      id: "desierto", name: "Desierto de Ceniza", icon: "🏜️", themeBoost: "human",
      desc: "Un mar de arena y ceniza donde bandidos y saqueadores acechan a los viajeros.",
      greeting: "El sol quema la piel y el viento arrastra ceniza. Las ruinas brillan en el horizonte.",
      mods: { enemyAtk: 1.10, goldMult: 1.25 },
      tip: "Enemigos +10% de daño, pero +25% de oro."
    },
    {
      id: "cripta", name: "Cripta Helada", icon: "⚰️", themeBoost: "undead",
      desc: "Tumbas olvidadas bajo la nieve. Los muertos no descansan y el frío muerde los huesos.",
      greeting: "El aire es gélido y huele a tierra húmeda. Las antorchas se apagan una a una.",
      mods: { xpMult: 1.15 },
      tip: "Ganas un 15% más de experiencia."
    },
    {
      id: "pantano", name: "Pantano Maldito", icon: "🌫️", themeBoost: "undead",
      desc: "Aguas turbias, niebla venenosa y criaturas que susurran bajo el lodo.",
      greeting: "El agua te llega a las rodillas. Algo se mueve bajo la superficie.",
      mods: { startPoison: 2, bonusPotions: 1 },
      tip: "Empiezas los combates envenenado, pero llevas una poción extra."
    },
    {
      id: "islas", name: "Islas Flotantes", icon: "🏝️", themeBoost: "magic",
      desc: "Fragmentos de tierra suspendidos sobre el vacío. La magia fluye libre y salvaje.",
      greeting: "Las islas flotan entre nubes rotas. Un zumbido arcano te llena los oídos.",
      mods: { resMaxMult: 1.2 },
      tip: "+20% de recurso máximo."
    },
    {
      id: "ruinas", name: "Ciudad en Ruinas", icon: "🏚️", themeBoost: "human",
      desc: "Las calles de una metrópolis caída. Mercaderes, cultistas y autómatas se disputan los escombros.",
      greeting: "Edificios derruidos se alzan como lápidas. Un mercado improvisado bulle entre los escombros.",
      mods: { goldMult: 1.3 },
      tip: "Ganas un 30% más de oro."
    }
  ];

  /* ---------------- temas de enemigos ---------------- */
  D.themes = [
    { id: "magic", name: "Mágicos", icon: "🔮", desc: "Imps, elementales, autómatas arcanos y magos renegados." },
    { id: "human", name: "Humanos", icon: "🗡️", desc: "Bandidos, cultistas, mercenarios y tiranos." },
    { id: "beast", name: "Bestias", icon: "🐺", desc: "Lobos, arañas, quimeras y depredadores salvajes." },
    { id: "undead", name: "No-muertos", icon: "💀", desc: "Esqueletos, espectros, nigromantes y liches." },
    { id: "construct", name: "Constructos", icon: "🤖", desc: "Golems, autómatas y guardianes de piedra y hierro." },
    { id: "mixed", name: "Mixto", icon: "🎲", desc: "Todo vale. Una mezcla imprevisible de todas las criaturas." }
  ];

  /* ---------------- dificultad ---------------- */
  D.difficulties = [
    { id: "peregrino", name: "Peregrino", icon: "🕊️", desc: "Para descubrir el juego. Enemigos más débiles y una segunda oportunidad.",
      enemyHp: 0.95, enemyAtk: 0.95, goldMult: 1.0, xpMult: 1.0, reviveBonus: 1, scoreMult: 0.8 },
    { id: "aventurero", name: "Aventurero", icon: "🧭", desc: "La experiencia equilibrada. El desafío justo para un héroe solitario.",
      enemyHp: 1.18, enemyAtk: 1.08, goldMult: 1.0, xpMult: 1.0, reviveBonus: 0, scoreMult: 1.0 },
    { id: "heroe", name: "Héroe", icon: "🔥", desc: "Enemigos resistentes y letales. Cada decisión pesa.",
      enemyHp: 1.38, enemyAtk: 1.24, goldMult: 1.15, xpMult: 1.1, reviveBonus: 0, scoreMult: 1.25 },
    { id: "leyenda", name: "Leyenda", icon: "☠️", desc: "Solo para veteranos. Enemigos brutales, sin piedad y sin resurrecciones.",
      enemyHp: 1.75, enemyAtk: 1.5, goldMult: 1.25, xpMult: 1.2, reviveBonus: -99, scoreMult: 1.6 }
  ];

  /* ---------------- duración ---------------- */
  D.lengths = [
    { id: "escaramuza", name: "Escaramuza", icon: "⚡", desc: "Una incursión corta: 6 etapas hasta el jefe final.", stages: 6, xpMult: 1.6 },
    { id: "aventura", name: "Aventura", icon: "🗺️", desc: "La experiencia completa: 10 etapas de viaje.", stages: 10, xpMult: 1.2 },
    { id: "campana", name: "Campaña", icon: "👑", desc: "Una gesta épica: 15 etapas y un jefe brutal.", stages: 15, xpMult: 1.0 }
  ];

  /* ---------------- compañeros ---------------- */
  D.companions = [
    { id: "ninguno", name: "Sin compañero", icon: "🚶", desc: "Viajas solo. Nadie más resultará herido.",
      every: 99, action: { type: "none" } },
    { id: "lobo", name: "Lobo Espectral", icon: "🐺", desc: "Cada 2 turnos muerde al enemigo más débil.",
      every: 2, action: { type: "damage", mult: 1.2, target: "lowest" } },
    { id: "espiritu", name: "Espíritu Sanador", icon: "🕊️", desc: "Cada 3 turnos te cura un 9% de tu vida máxima.",
      every: 3, action: { type: "heal", pct: 0.09 } },
    { id: "mercenario", name: "Mercenario", icon: "🛡️", desc: "Cada 2 turnos te otorga 8 de escudo.",
      every: 2, action: { type: "shield", value: 8 } },
    { id: "cuervo", name: "Cuervo Augur", icon: "🐦‍⬛", desc: "+25% de oro. Cada 3 turnos marca al enemigo más fuerte.",
      every: 3, action: { type: "status", status: { id: "mark", turns: 2, value: 0 }, target: "strongest" },
      mods: { goldMult: 1.25 } },
    { id: "golem", name: "Golem Menor", icon: "🪨", desc: "+12 de vida máxima. Cada 3 turnos te da 12 de escudo.",
      every: 3, action: { type: "shield", value: 12 }, mods: { maxHp: 12 } }
  ];

  /* ---------------- patrones ---------------- */
  D.patrons = [
    { id: "guerra", name: "Dios de la Guerra", icon: "⚔️", desc: "+12% de daño infligido.",
      mods: { dmgMult: 1.12 } },
    { id: "vida", name: "Madre de la Vida", icon: "🌿", desc: "+18% de vida máxima y +20% de curación.",
      mods: { maxHpMult: 1.18, healMult: 1.2 } },
    { id: "fortuna", name: "Señor de la Fortuna", icon: "🪙", desc: "+60% de oro y 20% de descuento en tiendas.",
      mods: { goldMult: 1.6, shopMult: 0.8 } },
    { id: "destino", name: "Tejedor del Destino", icon: "🎲", desc: "+6% de crítico y +15% de daño crítico.",
      mods: { crit: 0.06, critDmg: 0.15 } },
    { id: "sombra", name: "Señor de las Sombras", icon: "🌑", desc: "Los enemigos empiezan los combates con un 12% menos de vida.",
      mods: { ambush: 0.12 } },
    { id: "sabio", name: "El Sabio Errante", icon: "📜", desc: "+25% de experiencia y una mejora inicial extra.",
      mods: { xpMult: 1.25 }, bonusPerk: 1 }
  ];

  /* ---------------- maldiciones ---------------- */
  D.curses = [
    { id: "sangre", name: "Sangre Débil", icon: "🩸", desc: "-18% de vida máxima. Ganas una reliquia extra.",
      mods: { maxHpMult: 0.82 }, reward: { type: "relic" } },
    { id: "fragil", name: "Carne Frágil", icon: "💔", desc: "Los enemigos infligen +15% de daño. Ganas una mejora extra.",
      mods: { enemyAtkMult: 1.15 }, reward: { type: "perk" } },
    { id: "pobreza", name: "Voto de Pobreza", icon: "🕳️", desc: "Empiezas sin oro. Ganas un objeto raro.",
      mods: { startGold: 0 }, reward: { type: "item", rarity: "raro" } },
    { id: "inquieto", name: "Sueño Inquieto", icon: "🌙", desc: "Los descansos curan la mitad. Ganas +25% de experiencia y 80 de oro.",
      mods: { restHealMult: 0.5, xpMult: 1.25 }, reward: { type: "gold", value: 80 } },
    { id: "condenado", name: "Alma Condenada", icon: "⛓️", desc: "Sin resurrecciones. Ganas +12% de daño y 100 de oro.",
      mods: { noRevives: true, dmgMult: 1.12 }, reward: { type: "gold", value: 100 } },
    { id: "codicia", name: "Codicia Eterna", icon: "💰", desc: "Los precios suben un 40%. Empiezas con 100 de oro extra.",
      mods: { shopMult: 1.4 }, reward: { type: "gold", value: 100 } }
  ];

  /* ---------------- reliquias ---------------- */
  D.relics = [
    { id: "corazon", name: "Corazón de Piedra", icon: "❤️", rarity: "raro", desc: "+20 de vida máxima.", stats: { maxHp: 20 } },
    { id: "anillo", name: "Anillo del Poder", icon: "💍", rarity: "raro", desc: "+2 de ataque.", stats: { atk: 2 } },
    { id: "ambar", name: "Amuleto de Ébano", icon: "📿", rarity: "raro", desc: "+2 de defensa.", stats: { def: 2 } },
    { id: "halcon", name: "Ojo de Halcón", icon: "🦅", rarity: "raro", desc: "+8% de crítico.", stats: { crit: 0.08 } },
    { id: "grimorio", name: "Grimorio Menor", icon: "📖", rarity: "raro", desc: "+15 de recurso máximo y +2 de regeneración.", stats: { resMax: 15, resRegen: 2 } },
    { id: "moneda", name: "Moneda Antigua", icon: "🪙", rarity: "raro", desc: "+50% de oro obtenido.", stats: { goldMult: 1.5 } },
    { id: "fenix", name: "Pluma del Fénix", icon: "🪶", rarity: "épico", desc: "Revives una vez con el 35% de tu vida.", stats: { revive: 1 } },
    { id: "botas", name: "Botas Ligeras", icon: "👢", rarity: "raro", desc: "El primer ataque enemigo de cada combate falla.", stats: { firstDodge: 1 } },
    { id: "caliz", name: "Cáliz del Banquete", icon: "🏆", rarity: "épico", desc: "Recuperas un 12% de vida tras cada combate.", stats: { healAfterCombat: 0.12 } },
    { id: "sangre", name: "Talismán de Sangre", icon: "🧿", rarity: "épico", desc: "Robas un 15% del daño infligido.", stats: { lifesteal: 0.15 } },
    { id: "espejo", name: "Espejo Roto", icon: "🪞", rarity: "épico", desc: "Devuelves 5 de daño a quien te golpee.", stats: { thorns: 5 } },
    { id: "semilla", name: "Semilla Ancestral", icon: "🌱", rarity: "épico", desc: "Empiezas cada partida con una poción de vida extra.", stats: { bonusPotions: 1 } },
    { id: "verdugo", name: "Hacha del Verdugo", icon: "🪓", rarity: "épico", desc: "+25% de daño contra enemigos por debajo del 30% de vida.", stats: { execute: 0.25 } },
    { id: "errante", name: "Mapa del Errante", icon: "🗺️", rarity: "raro", desc: "+20% de experiencia.", stats: { xpMult: 1.2 } },
    { id: "titan", name: "Corazón de Titán", icon: "🫀", rarity: "legendario", desc: "+30 de vida máxima, -1 de defensa.", stats: { maxHp: 30, def: -1 } }
  ];

  /* ---------------- mejoras (perks) ---------------- */
  D.perks = [
    { id: "vigor", name: "Vigor", icon: "❤️", desc: "+14 de vida máxima.", stats: { maxHp: 14 } },
    { id: "poder", name: "Poderío", icon: "💪", desc: "+2 de ataque.", stats: { atk: 2 } },
    { id: "piel", name: "Piel de Hierro", icon: "🛡️", desc: "+2 de defensa.", stats: { def: 2 } },
    { id: "precision", name: "Precisión", icon: "🎯", desc: "+7% de probabilidad de crítico.", stats: { crit: 0.07 } },
    { id: "brutalidad", name: "Brutalidad", icon: "💥", desc: "+20% de daño crítico.", stats: { critDmg: 0.20 } },
    { id: "conduccion", name: "Conducción", icon: "💠", desc: "+15 de recurso máximo y +2 de regeneración.", stats: { resMax: 15, resRegen: 2 } },
    { id: "vampiro", name: "Sed de Sangre", icon: "🩸", desc: "Robas un 8% del daño infligido.", stats: { lifesteal: 0.08 } },
    { id: "espinas", name: "Espinas", icon: "🌵", desc: "Devuelves 4 de daño a quien te golpee.", stats: { thorns: 4 } },
    { id: "codicia", name: "Codicia", icon: "💰", desc: "+20% de oro obtenido.", stats: { goldMult: 1.2 } },
    { id: "erudito", name: "Erudito", icon: "📚", desc: "+12% de experiencia.", stats: { xpMult: 1.12 } },
    { id: "alquimista", name: "Alquimista", icon: "⚗️", desc: "+30% de curación (incluidas pociones).", stats: { healMult: 1.3 } },
    { id: "baluarte", name: "Baluarte", icon: "🧱", desc: "Empiezas cada combate con 8 de escudo.", stats: { startShield: 8 } },
    { id: "raudo", name: "Raudo", icon: "⚡", desc: "+2 de regeneración de recurso.", stats: { resRegen: 2 } },
    { id: "afortunado", name: "Afortunado", icon: "🍀", desc: "+5% de crítico y +10% de daño crítico.", stats: { crit: 0.05, critDmg: 0.10 } },
    { id: "superviviente", name: "Superviviente", icon: "🏕️", desc: "Recuperas un 10% de vida tras cada combate.", stats: { healAfterCombat: 0.10 } },
    { id: "duelista", name: "Duelista", icon: "🤺", desc: "+12% de daño cuando solo queda un enemigo.", stats: { dmgSingle: 0.12 } },
    { id: "verdugo", name: "Verdugo", icon: "🪓", desc: "+25% de daño contra enemigos por debajo del 30% de vida.", stats: { execute: 0.25 } },
    { id: "golpe", name: "Primer Golpe", icon: "⚡", desc: "Tu primer ataque de cada combate inflige +50% de daño.", stats: { firstStrike: 0.5 } },
    { id: "furia", name: "Furia Sangrienta", icon: "😡", desc: "+20% de daño cuando estás por debajo del 50% de vida.", stats: { lowHpDmg: 0.20 } },
    { id: "guardia", name: "Guardia Arcana", icon: "🔰", desc: "Recibes un 10% menos de daño.", stats: { dmgTakenMult: 0.9 } },
    { id: "frugal", name: "Eficiencia", icon: "🪄", desc: "Las habilidades cuestan un 10% menos.", stats: { skillCostMult: 0.9 } },
    { id: "regeneracion", name: "Regeneración", icon: "💚", desc: "Recuperas un 2% de vida al inicio de cada turno.", stats: { regenPerTurn: 0.02 } }
  ];

  /* ---------------- objetos ---------------- */
  D.itemSlots = {
    weapon:  { name: "Arma",       icon: "🗡️" },
    armor:   { name: "Armadura",   icon: "🛡️" },
    trinket: { name: "Amuleto",    icon: "📿" }
  };
  D.rarities = {
    comun:      { name: "Común",      order: 0 },
    raro:       { name: "Raro",       order: 1 },
    epico:      { name: "Épico",      order: 2 },
    legendario: { name: "Legendario", order: 3 }
  };

  D.weapons = [
    { id: "daga", name: "Daga Oxidada", icon: "🗡️", slot: "weapon", rarity: "comun", stats: { atk: 2, crit: 0.03 }, desc: "Vieja, pero afilada." },
    { id: "espada_corta", name: "Espada Corta", icon: "⚔️", slot: "weapon", rarity: "comun", stats: { atk: 3 }, desc: "El acero de siempre." },
    { id: "hacha_lenador", name: "Hacha de Leñador", icon: "🪓", slot: "weapon", rarity: "comun", stats: { atk: 4, def: -1 }, desc: "Pesada y poco elegante." },
    { id: "arco_cazador", name: "Arco de Cazador", icon: "🏹", slot: "weapon", rarity: "raro", stats: { atk: 4, crit: 0.05 }, desc: "Tensado con tendón de lobo." },
    { id: "baston_roble", name: "Bastón de Roble", icon: "🪄", slot: "weapon", rarity: "raro", stats: { atk: 3, resMax: 12 }, desc: "Canaliza magia con humildad." },
    { id: "mandoble", name: "Mandoble", icon: "⚔️", slot: "weapon", rarity: "raro", stats: { atk: 6, crit: -0.03 }, desc: "Lento, pero devastador." },
    { id: "maza_pesada", name: "Maza Pesada", icon: "🔨", slot: "weapon", rarity: "raro", stats: { atk: 5, def: 1 }, desc: "Aplasta armaduras." },
    { id: "cetro_arcano", name: "Cetro Arcano", icon: "🔮", slot: "weapon", rarity: "epico", stats: { atk: 4, resMax: 12, resRegen: 3 }, desc: "Late con energía antigua." },
    { id: "hoja_sombras", name: "Hoja de las Sombras", icon: "🗡️", slot: "weapon", rarity: "epico", stats: { atk: 6, crit: 0.08 }, desc: "La luz no se refleja en ella." },
    { id: "martillo_guerra", name: "Martillo de Guerra", icon: "🔨", slot: "weapon", rarity: "epico", stats: { atk: 7, def: 1 }, desc: "Forjado para romper líneas." },
    { id: "lanza_alba", name: "Lanza del Alba", icon: "🔱", slot: "weapon", rarity: "epico", stats: { atk: 8, crit: 0.03 }, desc: "Brilla al amanecer." },
    { id: "filo_alba", name: "Filo del Alba", icon: "⚔️", slot: "weapon", rarity: "legendario", stats: { atk: 9, crit: 0.06, lifesteal: 0.08 }, desc: "Corta carne y oscuridad por igual." },
    { id: "vara_archimago", name: "Vara del Archimago", icon: "🪄", slot: "weapon", rarity: "legendario", stats: { atk: 7, resMax: 25, resRegen: 4 }, desc: "Contiene el eco de mil hechizos." },
    { id: "espada_heroe", name: "Espada del Héroe", icon: "🗡️", slot: "weapon", rarity: "legendario", stats: { atk: 8, maxHp: 15 }, desc: "Solo un alma valiente puede blandirla." }
  ];

  D.armors = [
    { id: "ropa_lino", name: "Ropa de Lino", icon: "👕", slot: "armor", rarity: "comun", stats: { def: 1, maxHp: 5 }, desc: "Mejor que nada." },
    { id: "cota_cuero", name: "Cota de Cuero", icon: "🧥", slot: "armor", rarity: "comun", stats: { def: 2 }, desc: "Curtida y flexible." },
    { id: "tunica_aprendiz", name: "Túnica de Aprendiz", icon: "🥋", slot: "armor", rarity: "comun", stats: { def: 1, resMax: 8 }, desc: "Bordada con runas simples." },
    { id: "malla_hierro", name: "Malla de Hierro", icon: "🛡️", slot: "armor", rarity: "raro", stats: { def: 3, maxHp: 10 }, desc: "Ruidoso pero fiable." },
    { id: "capa_seda", name: "Capa de Seda", icon: "🧣", slot: "armor", rarity: "raro", stats: { def: 1, crit: 0.04 }, desc: "Ligera como una sombra." },
    { id: "cuero_tachonado", name: "Cuero Tachonado", icon: "🧥", slot: "armor", rarity: "raro", stats: { def: 2, maxHp: 8 }, desc: "Remaches de acero." },
    { id: "placas", name: "Armadura de Placas", icon: "🛡️", slot: "armor", rarity: "epico", stats: { def: 5, maxHp: 12 }, desc: "Una fortaleza portátil." },
    { id: "manto_runico", name: "Manto Rúnico", icon: "🧿", slot: "armor", rarity: "epico", stats: { def: 2, resRegen: 4, maxHp: 8 }, desc: "Teje maná en cada hilo." },
    { id: "coraza_obsidiana", name: "Coraza de Obsidiana", icon: "⬛", slot: "armor", rarity: "epico", stats: { def: 4, maxHp: 20 }, desc: "Piedra volcánica pulida." },
    { id: "coraza_coloso", name: "Coraza del Coloso", icon: "🏰", slot: "armor", rarity: "legendario", stats: { def: 7, maxHp: 25 }, desc: "Arrancada de un titán." },
    { id: "sudario", name: "Sudario Espectral", icon: "👻", slot: "armor", rarity: "legendario", stats: { def: 3, crit: 0.08, maxHp: 10 }, desc: "Te vuelve casi intangible." },
    { id: "piel_dragon", name: "Piel de Dragón", icon: "🐉", slot: "armor", rarity: "legendario", stats: { def: 6, maxHp: 15 }, desc: "Escamas que no temen al fuego." }
  ];

  D.trinkets = [
    { id: "ambar_trinket", name: "Amuleto de Ámbar", icon: "📿", slot: "trinket", rarity: "comun", stats: { maxHp: 8 }, desc: "Cálido al tacto." },
    { id: "anillo_hierro", name: "Anillo de Hierro", icon: "💍", slot: "trinket", rarity: "comun", stats: { atk: 1, def: 1 }, desc: "Simple y sólido." },
    { id: "talisman_suerte", name: "Talismán de Suerte", icon: "🍀", slot: "trinket", rarity: "raro", stats: { crit: 0.06 }, desc: "Nunca falla... casi nunca." },
    { id: "piedra_mana", name: "Piedra de Maná", icon: "💎", slot: "trinket", rarity: "raro", stats: { resMax: 15 }, desc: "Late con cada hechizo." },
    { id: "colmillo_lobo", name: "Colmillo de Lobo", icon: "🦷", slot: "trinket", rarity: "raro", stats: { atk: 2, lifesteal: 0.05 }, desc: "Aún gotea." },
    { id: "ojo_oraculo", name: "Ojo del Oráculo", icon: "👁️", slot: "trinket", rarity: "epico", stats: { crit: 0.05, critDmg: 0.2 }, desc: "Ve el golpe antes de que ocurra." },
    { id: "corazon_titan", name: "Corazón de Titán", icon: "🫀", slot: "trinket", rarity: "epico", stats: { maxHp: 20 }, desc: "Sigue latiendo." },
    { id: "brazal_furia", name: "Brazal de Furia", icon: "🧨", slot: "trinket", rarity: "epico", stats: { atk: 3, resRegen: 2 }, desc: "Quema con rabia contenida." },
    { id: "sello_vacio", name: "Sello del Vacío", icon: "🌌", slot: "trinket", rarity: "legendario", stats: { atk: 4, resRegen: 3, resMax: 10 }, desc: "Un trozo de nada que todo lo devora." },
    { id: "fenix_relic", name: "Reliquia del Fénix", icon: "🔥", slot: "trinket", rarity: "legendario", stats: { maxHp: 10, revive: 1 }, desc: "Renacerás de tus cenizas." },
    { id: "anillo_tirano", name: "Anillo del Tirano", icon: "👑", slot: "trinket", rarity: "legendario", stats: { atk: 5, crit: 0.05, maxHp: -10 }, desc: "Poder a cambio de sangre." }
  ];

  D.items = D.weapons.concat(D.armors, D.trinkets);

  /* ---------------- pociones ---------------- */
  D.potions = [
    { id: "vida", name: "Poción de Vida", icon: "🧪", price: 22, desc: "Cura un 30% de tu vida máxima.", effect: { type: "heal", pct: 0.30 } },
    { id: "mana", name: "Poción de Recurso", icon: "🔷", price: 18, desc: "Restaura 70 de recurso.", effect: { type: "resource", value: 70 } },
    { id: "antidoto", name: "Antídoto", icon: "💧", price: 16, desc: "Elimina todos tus efectos negativos y cura un 10%.", effect: { type: "cleanseHeal" } },
    { id: "fuerza", name: "Elixir de Fuerza", icon: "🍷", price: 26, desc: "+30% de daño durante 3 turnos.", effect: { type: "status", status: { id: "strength", turns: 3, value: 30 } } },
    { id: "bomba", name: "Bomba de Fuego", icon: "💣", price: 28, desc: "Inflige 35 de daño a todos los enemigos.", effect: { type: "bomb", value: 35 } },
    { id: "escudo", name: "Poción de Escudo", icon: "🛡️", price: 20, desc: "Ganas 30 de escudo.", effect: { type: "shield", value: 30 } }
  ];

  /* ---------------- roles de enemigos ---------------- */
  D.roles = {
    bruiser: [
      { name: "Golpe", icon: "🗡️", type: "attack", mult: 1.0, w: 4 },
      { name: "Golpe Pesado", icon: "💥", type: "attack", mult: 1.55, w: 2 },
      { name: "Rugido", icon: "😡", type: "buff", status: { id: "strength", turns: 3, value: 20 }, w: 1 }
    ],
    caster: [
      { name: "Descarga", icon: "✨", type: "attack", mult: 0.95, w: 4 },
      { name: "Maleficio", icon: "🌀", type: "debuff", status: { id: "weak", turns: 2, value: 0 }, w: 2 },
      { name: "Barrera", icon: "🔮", type: "defend", shield: 10, w: 1 },
      { name: "Drenar", icon: "🩸", type: "drain", mult: 0.85, healPct: 0.5, w: 1 }
    ],
    skirmisher: [
      { name: "Ráfaga", icon: "🌪️", type: "attack", mult: 0.6, hits: 2, w: 4 },
      { name: "Mordisco", icon: "🦷", type: "attack", mult: 0.9, status: { id: "bleed", turns: 2, value: 2, chance: 0.6 }, w: 3 },
      { name: "Zarpazo", icon: "🐾", type: "attack", mult: 1.15, w: 2 },
      { name: "Esquivar", icon: "💨", type: "buff", status: { id: "dodge", turns: 1, value: 0 }, w: 1 }
    ],
    tank: [
      { name: "Embate", icon: "🔨", type: "attack", mult: 1.05, w: 4 },
      { name: "Fortificar", icon: "🛡️", type: "defend", shield: 14, w: 2 },
      { name: "Provocar", icon: "😤", type: "debuff", status: { id: "vulnerable", turns: 2, value: 0 }, w: 1 }
    ],
    support: [
      { name: "Descarga", icon: "✨", type: "attack", mult: 0.7, w: 2 },
      { name: "Sanar Aliado", icon: "💚", type: "heal", healPct: 0.22, w: 3 },
      { name: "Bendecir", icon: "🔆", type: "buffAlly", status: { id: "strength", turns: 3, value: 20 }, w: 2 },
      { name: "Maldición", icon: "🌀", type: "debuff", status: { id: "weak", turns: 2, value: 0 }, w: 2 }
    ],
    boss: [
      { name: "Golpe Colosal", icon: "💥", type: "attack", mult: 1.45, w: 3 },
      { name: "Barrido", icon: "🌀", type: "attack", mult: 1.0, w: 3 },
      { name: "Grito de Guerra", icon: "😡", type: "buff", status: { id: "strength", turns: 3, value: 25 }, w: 1 },
      { name: "Terror", icon: "👁️", type: "debuff", status: { id: "vulnerable", turns: 2, value: 0 }, w: 1 },
      { name: "Devorar", icon: "🩸", type: "drain", mult: 1.1, healPct: 0.6, w: 1 }
    ]
  };

  /* ---------------- enemigos ---------------- */
  D.enemies = [
    /* --- mágicos --- */
    { id: "imp", name: "Imp Arcano", icon: "👺", theme: "magic", tier: "normal", role: "caster", hp: 22, atk: 6, def: 0, xp: 13, gold: 8,
      traits: { resist: { fire: 0.35 } }, signature: { name: "Llama Vil", icon: "🔥", type: "attack", mult: 1.0, status: { id: "burn", turns: 3, value: 3, chance: 0.7 }, w: 2 }, desc: "Un diablillo travieso de fuego." },
    { id: "golem_cristal", name: "Golem de Cristal", icon: "💠", theme: "magic", tier: "normal", role: "tank", hp: 32, atk: 6, def: 3, xp: 16, gold: 9,
      traits: { resist: { ice: 0.5 } }, signature: { name: "Fragmentos", icon: "💎", type: "attack", mult: 0.85, status: { id: "bleed", turns: 2, value: 2, chance: 0.5 }, w: 2 }, desc: "Cristal animado que refleja la luz." },
    { id: "fuego_fatuo", name: "Fuego Fatuo", icon: "🔵", theme: "magic", tier: "normal", role: "skirmisher", hp: 18, atk: 7, def: 0, xp: 13, gold: 8,
      traits: { resist: { physical: 0.25 } }, signature: { name: "Descarga Arcana", icon: "⚡", type: "attack", mult: 1.0, w: 2 }, desc: "Una chispa de magia con voluntad propia." },
    { id: "runa_viva", name: "Runa Viviente", icon: "🔣", theme: "magic", tier: "normal", role: "bruiser", hp: 26, atk: 7, def: 1, xp: 14, gold: 8,
      traits: {}, signature: { name: "Explosión Rúnica", icon: "💥", type: "attack", mult: 1.25, status: { id: "burn", turns: 2, value: 3, chance: 0.5 }, w: 2 }, desc: "Símbolos que se arrastran y brillan." },

    /* --- humanos --- */
    { id: "bandido", name: "Bandido", icon: "🏴", theme: "human", tier: "normal", role: "bruiser", hp: 26, atk: 7, def: 1, xp: 14, gold: 11,
      traits: {}, signature: { name: "Puñalada Sucia", icon: "🔪", type: "attack", mult: 1.0, status: { id: "bleed", turns: 2, value: 2, chance: 0.6 }, w: 2 }, desc: "Robar es más fácil que trabajar." },
    { id: "maton", name: "Matón", icon: "🪃", theme: "human", tier: "normal", role: "tank", hp: 30, atk: 7, def: 2, xp: 15, gold: 10,
      traits: {}, signature: { name: "Porrazo", icon: "🏏", type: "attack", mult: 1.2, w: 2 }, desc: "Contratado para romper cosas." },
    { id: "degollador", name: "Degollador", icon: "🗡️", theme: "human", tier: "normal", role: "skirmisher", hp: 22, atk: 8, def: 0, xp: 14, gold: 12,
      traits: {}, signature: { name: "Corte Rápido", icon: "⚡", type: "attack", mult: 0.7, hits: 2, w: 2 }, desc: "Rápido, silencioso y barato." },
    { id: "cultista", name: "Cultista", icon: "🕯️", theme: "human", tier: "normal", role: "caster", hp: 24, atk: 6, def: 1, xp: 14, gold: 10,
      traits: {}, signature: { name: "Palabra Prohibida", icon: "🌀", type: "debuff", status: { id: "weak", turns: 3, value: 0 }, w: 2 }, desc: "Susurra nombres que no deberías oír." },
    { id: "arquero_bandido", name: "Arquero Bandido", icon: "🏹", theme: "human", tier: "normal", role: "skirmisher", hp: 23, atk: 8, def: 0, xp: 14, gold: 11,
      traits: {}, signature: { name: "Flecha Envenenada", icon: "☠️", type: "attack", mult: 0.8, status: { id: "poison", turns: 3, value: 3, chance: 0.7 }, w: 2 }, desc: "Dispara desde las sombras." },

    /* --- bestias --- */
    { id: "lobo", name: "Lobo Gris", icon: "🐺", theme: "beast", tier: "normal", role: "skirmisher", hp: 22, atk: 7, def: 1, xp: 13, gold: 6,
      traits: {}, signature: { name: "Aullido", icon: "🌕", type: "buff", status: { id: "strength", turns: 3, value: 20 }, w: 1 }, desc: "Caza en manada." },
    { id: "arana", name: "Araña Gigante", icon: "🕷️", theme: "beast", tier: "normal", role: "skirmisher", hp: 20, atk: 6, def: 0, xp: 13, gold: 7,
      traits: {}, signature: { name: "Mordida Venenosa", icon: "☠️", type: "attack", mult: 0.8, status: { id: "poison", turns: 3, value: 4, chance: 0.8 }, w: 2 }, desc: "Teje telas entre los árboles." },
    { id: "jabali", name: "Jabalí Furioso", icon: "🐗", theme: "beast", tier: "normal", role: "bruiser", hp: 30, atk: 8, def: 1, xp: 15, gold: 7,
      traits: {}, signature: { name: "Embestida", icon: "💨", type: "attack", mult: 1.3, w: 2 }, desc: "No conoce el miedo ni la prudencia." },
    { id: "arpia", name: "Arpía", icon: "🦅", theme: "beast", tier: "normal", role: "skirmisher", hp: 24, atk: 7, def: 0, xp: 14, gold: 9,
      traits: {}, signature: { name: "Graznido", icon: "📢", type: "debuff", status: { id: "vulnerable", turns: 2, value: 0 }, w: 2 }, desc: "Su canto desorienta." },

    /* --- no-muertos --- */
    { id: "esqueleto", name: "Esqueleto", icon: "💀", theme: "undead", tier: "normal", role: "bruiser", hp: 24, atk: 7, def: 2, xp: 14, gold: 8,
      traits: { resist: { bleed: 0.8 } }, signature: { name: "Filo Óseo", icon: "🦴", type: "attack", mult: 1.2, w: 2 }, desc: "Huesos viejos que aún recuerdan luchar." },
    { id: "zombi", name: "Zombi", icon: "🧟", theme: "undead", tier: "normal", role: "tank", hp: 34, atk: 6, def: 1, xp: 15, gold: 7,
      traits: { regen: 2 }, signature: { name: "Mordisco Fétido", icon: "🦷", type: "attack", mult: 0.9, status: { id: "poison", turns: 2, value: 2, chance: 0.5 }, w: 2 }, desc: "Lento, putrefacto e implacable." },
    { id: "espectro", name: "Espectro", icon: "👻", theme: "undead", tier: "normal", role: "caster", hp: 20, atk: 7, def: 0, xp: 14, gold: 9,
      traits: { resist: { physical: 0.3 } }, signature: { name: "Toque Gélido", icon: "🧊", type: "attack", mult: 0.9, status: { id: "weak", turns: 2, value: 0, chance: 0.6 }, w: 2 }, desc: "Un lamento con forma humana." },
    { id: "ghoul", name: "Ghoul", icon: "🧛", theme: "undead", tier: "normal", role: "skirmisher", hp: 26, atk: 8, def: 1, xp: 15, gold: 8,
      traits: {}, signature: { name: "Zarpazo Cadavérico", icon: "🩸", type: "attack", mult: 1.1, status: { id: "bleed", turns: 2, value: 3, chance: 0.7 }, w: 2 }, desc: "Hambre que no muere." },

    /* --- constructos --- */
    { id: "automata", name: "Autómata", icon: "🤖", theme: "construct", tier: "normal", role: "tank", hp: 30, atk: 7, def: 2, xp: 15, gold: 9,
      traits: { shieldStart: 8 }, signature: { name: "Descarga", icon: "⚡", type: "attack", mult: 1.1, w: 2 }, desc: "Engranajes que nunca se detienen." },
    { id: "gargola", name: "Gárgola", icon: "🗿", theme: "construct", tier: "normal", role: "bruiser", hp: 24, atk: 8, def: 2, xp: 15, gold: 9,
      traits: { resist: { physical: 0.2 } }, signature: { name: "Garra de Piedra", icon: "🪨", type: "attack", mult: 1.2, w: 2 }, desc: "Despierta cuando no miras." },
    { id: "centinela", name: "Centinela", icon: "🛰️", theme: "construct", tier: "normal", role: "tank", hp: 28, atk: 6, def: 3, xp: 15, gold: 10,
      traits: {}, signature: { name: "Cañón de Luz", icon: "🔆", type: "attack", mult: 1.3, w: 2 }, desc: "Vigila un tesoro que ya no existe." },
    { id: "chatarra", name: "Chatarra Viviente", icon: "⚙️", theme: "construct", tier: "normal", role: "skirmisher", hp: 22, atk: 7, def: 1, xp: 13, gold: 11,
      traits: {}, signature: { name: "Chispazo", icon: "⚡", type: "attack", mult: 0.8, status: { id: "burn", turns: 2, value: 3, chance: 0.6 }, w: 2 }, desc: "Un montón de metal con malas intenciones." },

    /* --- élites --- */
    { id: "archimago", name: "Archimago Renegado", icon: "🧙", theme: "magic", tier: "elite", role: "caster", hp: 68, atk: 10, def: 1, xp: 40, gold: 30,
      traits: { resist: { fire: 0.4, ice: 0.4 } }, signature: { name: "Meteoro", icon: "☄️", type: "attack", mult: 1.6, status: { id: "burn", turns: 3, value: 4, chance: 0.8 }, w: 2 }, desc: "Su poder rompió una academia." },
    { id: "elemental_tormenta", name: "Elemental de Tormenta", icon: "🌩️", theme: "magic", tier: "elite", role: "bruiser", hp: 72, atk: 11, def: 2, xp: 42, gold: 28,
      traits: { resist: { physical: 0.25 } }, signature: { name: "Rayo", icon: "⚡", type: "attack", mult: 1.5, status: { id: "stun", turns: 1, value: 0, chance: 0.2 }, w: 2 }, desc: "La tormenta cobró forma." },
    { id: "capitan_bandido", name: "Capitán Bandido", icon: "🏴‍☠️", theme: "human", tier: "elite", role: "bruiser", hp: 76, atk: 11, def: 2, xp: 42, gold: 40,
      traits: {}, signature: { name: "Tajo Doble", icon: "⚔️", type: "attack", mult: 0.9, hits: 2, w: 2 }, desc: "Nadie roba en su territorio sin pagar." },
    { id: "inquisidor", name: "Inquisidor", icon: "⛪", theme: "human", tier: "elite", role: "support", hp: 66, atk: 9, def: 2, xp: 40, gold: 35,
      traits: {}, signature: { name: "Sentencia", icon: "⚖️", type: "attack", mult: 1.3, status: { id: "weak", turns: 2, value: 0, chance: 0.7 }, w: 2 }, desc: "La fe como arma, el miedo como escudo." },
    { id: "oso_colosal", name: "Oso Colosal", icon: "🐻", theme: "beast", tier: "elite", role: "bruiser", hp: 88, atk: 12, def: 2, xp: 45, gold: 30,
      traits: { enrage: true }, signature: { name: "Zarpazo Brutal", icon: "🐾", type: "attack", mult: 1.5, w: 2 }, desc: "El dueño absoluto del bosque." },
    { id: "quimera", name: "Quimera", icon: "🦁", theme: "beast", tier: "elite", role: "skirmisher", hp: 74, atk: 11, def: 2, xp: 43, gold: 32,
      traits: { resist: { fire: 0.3 } }, signature: { name: "Aliento Ígneo", icon: "🔥", type: "attack", mult: 1.2, status: { id: "burn", turns: 2, value: 4, chance: 0.7 }, w: 2 }, desc: "Tres bestias en un solo cuerpo." },
    { id: "caballero_muerto", name: "Caballero Muerto", icon: "🏇", theme: "undead", tier: "elite", role: "tank", hp: 90, atk: 11, def: 3, xp: 46, gold: 32,
      traits: { resist: { bleed: 0.9 } }, signature: { name: "Carga Espectral", icon: "🐎", type: "attack", mult: 1.4, w: 2 }, desc: "Cumple una promesa que ya nadie recuerda." },
    { id: "nigromante", name: "Nigromante", icon: "🧥", theme: "undead", tier: "elite", role: "support", hp: 62, atk: 9, def: 1, xp: 42, gold: 35,
      traits: {}, signature: { name: "Drenar Vida", icon: "🩸", type: "drain", mult: 1.0, healPct: 0.7, w: 2 }, desc: "La muerte es solo otro sirviente." },
    { id: "coloso_hierro", name: "Coloso de Hierro", icon: "🦾", theme: "construct", tier: "elite", role: "tank", hp: 95, atk: 11, def: 4, xp: 46, gold: 36,
      traits: { shieldStart: 12 }, signature: { name: "Pisotón", icon: "🦶", type: "attack", mult: 1.4, w: 2 }, desc: "Una máquina de asedio sin amo." },
    { id: "vigia_antiguo", name: "Vigía Antiguo", icon: "👁️", theme: "construct", tier: "elite", role: "caster", hp: 68, atk: 11, def: 2, xp: 42, gold: 34,
      traits: {}, signature: { name: "Rayo Ocular", icon: "🔆", type: "attack", mult: 1.5, w: 2 }, desc: "Lleva siglos observando." },

    /* --- jefes --- */
    { id: "ojo_vacio", name: "El Ojo del Vacío", icon: "👁️", theme: "magic", tier: "boss", role: "boss", hp: 200, atk: 13, def: 2, xp: 120, gold: 90,
      traits: { resist: { fire: 0.3, ice: 0.3, arcane: 0.3 }, phase: true }, signature: { name: "Rayo del Vacío", icon: "🌌", type: "attack", mult: 1.5, status: { id: "weak", turns: 2, value: 0, chance: 0.6 }, w: 2 }, desc: "Mira dentro de ti y no le gusta lo que ve." },
    { id: "senor_runas", name: "Señor de las Runas", icon: "🔯", theme: "magic", tier: "boss", role: "boss", hp: 220, atk: 14, def: 3, xp: 130, gold: 100,
      traits: { phase: true }, signature: { name: "Sello Arcano", icon: "🔮", type: "attack", mult: 1.4, status: { id: "vulnerable", turns: 2, value: 0, chance: 0.7 }, w: 2 }, desc: "Escribió las reglas de este mundo." },
    { id: "rey_bandido", name: "Rey de los Bandidos", icon: "👑", theme: "human", tier: "boss", role: "boss", hp: 210, atk: 14, def: 3, xp: 125, gold: 140,
      traits: { phase: true }, signature: { name: "Ejecución", icon: "🪓", type: "attack", mult: 1.6, w: 2 }, desc: "Corona de latón, trono de cadáveres." },
    { id: "general_caido", name: "General Caído", icon: "🎖️", theme: "human", tier: "boss", role: "boss", hp: 235, atk: 14, def: 4, xp: 130, gold: 120,
      traits: { phase: true }, signature: { name: "Lanza de Mando", icon: "🔱", type: "attack", mult: 1.4, status: { id: "bleed", turns: 2, value: 4, chance: 0.6 }, w: 2 }, desc: "Su ejército murió con él. Él no lo aceptó." },
    { id: "devorador", name: "Devorador de Almas", icon: "🕳️", theme: "beast", tier: "boss", role: "boss", hp: 220, atk: 15, def: 2, xp: 125, gold: 90,
      traits: { phase: true, lifesteal: 0.15 }, signature: { name: "Devorar", icon: "🩸", type: "drain", mult: 1.2, healPct: 0.6, w: 2 }, desc: "Nadie recuerda cómo era antes de tener hambre." },
    { id: "tirano_bestias", name: "Tirano de las Bestias", icon: "🦖", theme: "beast", tier: "boss", role: "boss", hp: 240, atk: 15, def: 3, xp: 135, gold: 100,
      traits: { phase: true, enrage: true }, signature: { name: "Rugido Primal", icon: "📢", type: "buff", status: { id: "strength", turns: 3, value: 35 }, w: 2 }, desc: "Todas las criaturas le obedecen." },
    { id: "lich", name: "El Liche", icon: "🧙‍♂️", theme: "undead", tier: "boss", role: "boss", hp: 195, atk: 13, def: 2, xp: 125, gold: 110,
      traits: { phase: true, resist: { poison: 0.8, bleed: 0.8 } }, signature: { name: "Nova de Almas", icon: "💀", type: "attack", mult: 1.4, status: { id: "weak", turns: 2, value: 0, chance: 0.7 }, w: 2 }, desc: "Cambió su vida por conocimiento eterno." },
    { id: "rey_esqueleto", name: "Rey Esqueleto", icon: "☠️", theme: "undead", tier: "boss", role: "boss", hp: 235, atk: 15, def: 4, xp: 130, gold: 120,
      traits: { phase: true, resist: { bleed: 0.9 } }, signature: { name: "Mandoble Óseo", icon: "🦴", type: "attack", mult: 1.5, w: 2 }, desc: "Gobierna un reino de polvo." },
    { id: "titan_obsidiana", name: "Titán de Obsidiana", icon: "🗿", theme: "construct", tier: "boss", role: "boss", hp: 260, atk: 14, def: 5, xp: 135, gold: 110,
      traits: { phase: true, resist: { physical: 0.2 } }, signature: { name: "Mazazo Sísmico", icon: "💥", type: "attack", mult: 1.5, status: { id: "stun", turns: 1, value: 0, chance: 0.15 }, w: 2 }, desc: "La montaña que camina." },
    { id: "corazon_forja", name: "Corazón de la Forja", icon: "🔥", theme: "construct", tier: "boss", role: "boss", hp: 220, atk: 15, def: 3, xp: 130, gold: 120,
      traits: { phase: true, shieldStart: 20 }, signature: { name: "Lluvia de Chispas", icon: "✨", type: "attack", mult: 0.8, hits: 2, status: { id: "burn", turns: 2, value: 3, chance: 0.5 }, w: 2 }, desc: "El motor de una civilización extinta." }
  ];

  /* ---------------- eventos ---------------- */
  D.events = [
    {
      id: "altar_huesos", name: "Altar de Huesos", icon: "💀",
      text: "Un altar de huesos se alza entre la maleza. Las ofrendas aún están intactas y algo antiguo parece escuchar tu respiración.",
      choices: [
        { label: "Rezar en silencio", desc: "Ofrece tu sangre a lo desconocido.", effects: [{ t: "damage", pct: 0.15 }, { t: "relic" }] },
        { label: "Saquear las ofrendas", desc: "Toma el oro... si el guardián te deja.", effects: [{ t: "gold", v: 45 }, { t: "combat", tier: "normal" }] },
        { label: "Ignorar el altar", desc: "Algunas puertas es mejor no abrir.", effects: [] }
      ]
    },
    {
      id: "fuente_luz", name: "Fuente de Luz", icon: "⛲",
      text: "Una fuente de agua luminosa brota de la roca. El aire huele a tormenta y a flores recién cortadas.",
      choices: [
        { label: "Beber de la fuente", desc: "Puede curarte... o cambiarte.", effects: [{ t: "random", outcomes: [
          [{ t: "heal", pct: 0.35 }],
          [{ t: "heal", pct: 0.2 }, { t: "maxHp", v: 5 }]
        ] }] },
        { label: "Llenar tus frascos", desc: "Consigues dos pociones de vida.", effects: [{ t: "potion", id: "vida", n: 2 }] },
        { label: "Marcharte", desc: "No confías en el agua.", effects: [] }
      ]
    },
    {
      id: "mercader_errante", name: "Mercader Errante", icon: "🧳",
      text: "Un mercader de mirada esquiva despliega su manto. «Tengo lo que necesitas —dice—, aunque quizá no lo sepas aún».",
      choices: [
        { label: "Comprar una poción (18 oro)", desc: "Una poción de vida a buen precio.", req: { gold: 18 }, effects: [{ t: "gold", v: -18 }, { t: "potion", id: "vida", n: 1 }] },
        { label: "Escuchar sus rumores (10 oro)", desc: "Información valiosa.", req: { gold: 10 }, effects: [{ t: "gold", v: -10 }, { t: "xp", v: 20 }] },
        { label: "Robarle", desc: "Rápido y sucio.", effects: [{ t: "combat", tier: "normal" }] },
        { label: "Despedirte", desc: "No hay trato.", effects: [] }
      ]
    },
    {
      id: "cofre_antiguo", name: "Cofre Antiguo", icon: "🧰",
      text: "Un cofre cubierto de polvo y sellos gastados. La cerradura parece más vieja que el propio camino.",
      choices: [
        { label: "Forzar la cerradura", desc: "Podría haber un tesoro... o una trampa.", effects: [{ t: "random", outcomes: [
          [{ t: "item", rarity: "raro" }],
          [{ t: "damage", pct: 0.18 }]
        ] }] },
        { label: "Examinarlo con cuidado", desc: "Aprendes algo de su historia.", effects: [{ t: "xp", v: 15 }, { t: "gold", v: 10 }] },
        { label: "Dejarlo intacto", desc: "La prudencia también es sabiduría.", effects: [] }
      ]
    },
    {
      id: "viajero_herido", name: "Viajero Herido", icon: "🩹",
      text: "Un viajero yace junto al sendero, con la pierna atrapada bajo una carreta rota. Te mira con desesperación.",
      choices: [
        { label: "Ayudarle (20 oro)", desc: "Te lo agradecerá como pueda.", req: { gold: 20 }, effects: [{ t: "gold", v: -20 }, { t: "maxHp", v: 5 }, { t: "xp", v: 15 }] },
        { label: "Robarle", desc: "Su desgracia es tu oportunidad.", effects: [{ t: "gold", v: 25 }] },
        { label: "Seguir tu camino", desc: "No es tu problema.", effects: [] }
      ]
    },
    {
      id: "campo_batalla", name: "Campo de Batalla", icon: "⚔️",
      text: "Los restos de una batalla antigua cubren la llanura. Cuervos y armaduras vacías comparten el silencio.",
      choices: [
        { label: "Saquear los cuerpos", desc: "Un objeto entre los restos.", effects: [{ t: "item", rarity: "comun" }] },
        { label: "Enterrar a los caídos", desc: "Un gesto que reconforta el alma.", effects: [{ t: "heal", pct: 0.2 }, { t: "xp", v: 20 }] },
        { label: "Alejarte", desc: "Los muertos merecen descanso.", effects: [] }
      ]
    },
    {
      id: "trampa", name: "Trampa de Cazador", icon: "🪤",
      text: "Un mecanismo oxidado bloquea el paso. Alguien lo colocó hace mucho, pero sigue funcionando.",
      choices: [
        { label: "Desarmarla", desc: "Con paciencia, quizá aprendas algo.", effects: [{ t: "xp", v: 18 }, { t: "gold", v: 10 }] },
        { label: "Forzar el paso", desc: "Duele, pero encuentras algo.", effects: [{ t: "damage", pct: 0.12 }, { t: "item", rarity: "comun" }] },
        { label: "Rodearla", desc: "Pierdes tiempo, no sangre.", effects: [] }
      ]
    },
    {
      id: "dados", name: "Dados del Destino", icon: "🎲",
      text: "Una mesa de juego abandonada, con dados de hueso y una banca llena de monedas. Nadie vigila... aparentemente.",
      choices: [
        { label: "Apostar 30 oro", desc: "Doble o nada.", req: { gold: 30 }, effects: [{ t: "gold", v: -30 }, { t: "random", outcomes: [[{ t: "gold", v: 90 }], []] }] },
        { label: "Jugar por diversión", desc: "Ganas experiencia, no oro.", effects: [{ t: "xp", v: 10 }] },
        { label: "No tentar a la suerte", desc: "Los dados siempre ganan.", effects: [] }
      ]
    },
    {
      id: "entrenamiento", name: "Campo de Entrenamiento", icon: "🏋️",
      text: "Un claro con maniquíes destrozados y un cartel: «El acero se afila con acero». Parece un buen lugar para mejorar.",
      choices: [
        { label: "Entrenar la fuerza", desc: "+1 de ataque permanente.", effects: [{ t: "atk", v: 1 }] },
        { label: "Practicar defensa", desc: "+1 de defensa permanente.", effects: [{ t: "def", v: 1 }] },
        { label: "Resistencia", desc: "+8 de vida máxima.", effects: [{ t: "maxHp", v: 8 }] }
      ]
    },
    {
      id: "biblioteca", name: "Biblioteca Olvidada", icon: "📚",
      text: "Estanterías infinitas se pudren en la humedad. Algunos tomos aún susurran cuando los rozas.",
      choices: [
        { label: "Estudiar los tomos", desc: "Conocimiento prohibido.", effects: [{ t: "xp", v: 30 }] },
        { label: "Buscar un grimorio", desc: "Poder antiguo, a un precio.", effects: [{ t: "damage", pct: 0.1 }, { t: "item", rarity: "epico" }] },
        { label: "Vender los libros", desc: "El saber también pesa oro.", effects: [{ t: "gold", v: 30 }] }
      ]
    },
    {
      id: "prisionero", name: "Prisión Oxidada", icon: "🔗",
      text: "Una jaula oxidada cuelga de un árbol. Dentro, un prisionero demacrado te implora ayuda.",
      choices: [
        { label: "Liberarle", desc: "Te cuenta lo que sabe.", effects: [{ t: "xp", v: 25 }, { t: "heal", pct: 0.1 }] },
        { label: "Saquear la jaula", desc: "Encuentras oro escondido.", effects: [{ t: "gold", v: 30 }] },
        { label: "Ignorarle", desc: "No puedes salvar a todos.", effects: [] }
      ]
    },
    {
      id: "altar_sangre", name: "Altar de Sangre", icon: "🩸",
      text: "Un cuenco de piedra negra espera sangre. Las runas prometen poder a cambio de sacrificio.",
      choices: [
        { label: "Sacrificar vida (20%)", desc: "+2 de ataque permanente.", effects: [{ t: "damage", pct: 0.2 }, { t: "atk", v: 2 }] },
        { label: "Sacrificar un poco (10%)", desc: "+2 de defensa permanente.", effects: [{ t: "damage", pct: 0.1 }, { t: "def", v: 2 }] },
        { label: "Negarte", desc: "Tu sangre se queda contigo.", effects: [] }
      ]
    },
    {
      id: "hada", name: "Hada del Pantano", icon: "🧚", scenarios: ["pantano", "bosque"],
      text: "Una luz verde danza sobre el agua. Una voz diminuta te ofrece un regalo a cambio de una sonrisa.",
      choices: [
        { label: "Aceptar el regalo", desc: "Pociones y un poco de curación.", effects: [{ t: "potion", id: "vida", n: 2 }, { t: "heal", pct: 0.15 }] },
        { label: "Bailar con ella", desc: "Una experiencia extraña.", effects: [{ t: "xp", v: 10 }] },
        { label: "Intentar atraparla", desc: "Podría salir bien... o muy mal.", effects: [{ t: "random", outcomes: [[{ t: "gold", v: 40 }], [{ t: "damage", pct: 0.12 }]] }] }
      ]
    },
    {
      id: "espejismo", name: "Espejismo", icon: "🌵", scenarios: ["desierto"],
      text: "Una ciudad dorada flota en el horizonte. Sabes que no existe, pero el agua que promete es real para tu garganta.",
      choices: [
        { label: "Seguir el espejismo", desc: "Quizá haya algo real al final.", effects: [{ t: "random", outcomes: [[{ t: "gold", v: 50 }], [{ t: "damage", pct: 0.15 }]] }] },
        { label: "Descansar a la sombra", desc: "Recuperas fuerzas.", effects: [{ t: "heal", pct: 0.12 }] },
        { label: "Ignorarlo", desc: "El desierto juega con los sedientos.", effects: [] }
      ]
    },
    {
      id: "cripta_sellada", name: "Cripta Sellada", icon: "⚰️", scenarios: ["cripta"],
      text: "Una puerta de piedra cubierta de hielo. Algo golpea desde el otro lado, con un ritmo casi humano.",
      choices: [
        { label: "Abrir la cripta", desc: "Un guardián te espera. Su tesoro también.", effects: [{ t: "combat", tier: "elite", bonus: { relic: true } }] },
        { label: "Sellar la puerta", desc: "Aprendes de las runas.", effects: [{ t: "xp", v: 20 }] },
        { label: "Marcharte", desc: "Hay cosas que deben dormir.", effects: [] }
      ]
    },
    {
      id: "portal", name: "Portal Inestable", icon: "🌀", scenarios: ["islas"],
      text: "Un portal de luz púrpura gira sobre sí mismo, escupiendo ecos de lugares que no existen.",
      choices: [
        { label: "Atravesarlo", desc: "Un objeto de otro mundo, a cambio de dolor.", effects: [{ t: "damage", pct: 0.15 }, { t: "item", rarity: "epico" }] },
        { label: "Estudiar sus runas", desc: "Conocimiento arcano.", effects: [{ t: "xp", v: 25 }] },
        { label: "Sellarlo", desc: "Recibes oro de los restos.", effects: [{ t: "gold", v: 20 }] }
      ]
    },
    {
      id: "mercado_negro", name: "Mercado Negro", icon: "🕶️", scenarios: ["ruinas"],
      text: "Entre los escombros, figuras encapuchadas comercian con reliquias robadas. Nadie hace preguntas.",
      choices: [
        { label: "Comprar una reliquia (70 oro)", desc: "Un objeto único.", req: { gold: 70 }, effects: [{ t: "gold", v: -70 }, { t: "relic" }] },
        { label: "Comprar una poción (15 oro)", desc: "Precio de mercado.", req: { gold: 15 }, effects: [{ t: "gold", v: -15 }, { t: "potion", id: "vida", n: 1 }] },
        { label: "Robar y huir", desc: "Rápido. Peligroso.", effects: [{ t: "combat", tier: "normal" }] }
      ]
    },
    {
      id: "sanador", name: "Sanador Errante", icon: "⛑️",
      text: "Un anciano de manos firmes prepara vendas sobre una manta. «La vida tiene un precio —dice—, pero hoy puedo rebajarlo».",
      choices: [
        { label: "Tratamiento completo (25 oro)", desc: "Recuperas el 50% de tu vida.", req: { gold: 25 }, effects: [{ t: "gold", v: -25 }, { t: "heal", pct: 0.5 }] },
        { label: "Tratamiento básico (10 oro)", desc: "Recuperas el 20% de tu vida.", req: { gold: 10 }, effects: [{ t: "gold", v: -10 }, { t: "heal", pct: 0.2 }] },
        { label: "Rechazar y seguir", desc: "Las heridas pueden esperar.", effects: [] }
      ]
    },
    {
      id: "tormenta", name: "Tormenta Feroz", icon: "⛈️",
      text: "Nubes negras se ciernen sobre el camino. El viento aúlla y los rayos parten el cielo.",
      choices: [
        { label: "Refugiarte", desc: "Esperas a que pase.", effects: [{ t: "heal", pct: 0.15 }, { t: "xp", v: 10 }] },
        { label: "Correr bajo la lluvia", desc: "Rápido, pero peligroso.", effects: [{ t: "damage", pct: 0.1 }, { t: "gold", v: 20 }] },
        { label: "Esperar paciente", desc: "La tormenta también pasa.", effects: [] }
      ]
    },
    {
      id: "forja", name: "Forja Abandonada", icon: "🔨",
      text: "Una fragua aún caliente. Alguien se marchó hace poco, o quizá nunca se fue.",
      choices: [
        { label: "Mejorar tu arma", desc: "Tu arma gana +2 de ataque.", effects: [{ t: "weaponUpgrade", v: 2 }] },
        { label: "Vender la chatarra", desc: "Metal por oro.", effects: [{ t: "gold", v: 35 }] },
        { label: "Seguir adelante", desc: "No hay tiempo para trabajar el hierro.", effects: [] }
      ]
    },
    {
      id: "templo", name: "Templo Antiguo", icon: "🏛️",
      text: "Columnas rotas sostienen un techo que ya no existe. En el centro, un altar dedicado a seis dioses olvidados.",
      choices: [
        { label: "Rezar al Dios de la Guerra", desc: "+2 de ataque permanente.", effects: [{ t: "atk", v: 2 }] },
        { label: "Rezar a la Diosa de la Vida", desc: "+3 de defensa permanente.", effects: [{ t: "def", v: 3 }] },
        { label: "Rezar al Dios del Umbral", desc: "+15 de vida máxima y curación completa.", effects: [{ t: "maxHp", v: 15 }, { t: "fullHeal" }] }
      ]
    },
    {
      id: "espiritu_bosque", name: "Espíritu del Bosque", icon: "🌳", scenarios: ["bosque"],
      text: "Un rostro de corteza emerge de un árbol milenario. «Los que dan, reciben», murmura con voz de hojas.",
      choices: [
        { label: "Ofrecer 20 oro", desc: "El bosque te recompensa.", req: { gold: 20 }, effects: [{ t: "gold", v: -20 }, { t: "item", rarity: "raro" }] },
        { label: "Danzar con los espíritus", desc: "Te sientes renovado.", effects: [{ t: "heal", pct: 0.25 }] },
        { label: "Retirarte", desc: "No todos los espíritus son amables.", effects: [] }
      ]
    },
    {
      id: "arena", name: "Arena de Sombras", icon: "🏟️", scenarios: ["ruinas", "desierto"],
      text: "Un círculo de piedra rodeado de gradas vacías. En el centro, un campeón espera contrincante desde hace años.",
      choices: [
        { label: "Aceptar el desafío", desc: "Un élite te espera. La gloria también.", effects: [{ t: "combat", tier: "elite", bonus: { gold: 50 } }] },
        { label: "Observar y aprender", desc: "Estudias su técnica.", effects: [{ t: "xp", v: 10 }] },
        { label: "Salir de la arena", desc: "No hay gloria sin riesgo.", effects: [] }
      ]
    },
    {
      id: "naufragio", name: "Naufragio", icon: "🚢", scenarios: ["islas", "pantano"],
      text: "Los restos de un barco se pudren sobre las rocas. Las olas golpean un cofre todavía cerrado.",
      choices: [
        { label: "Bucear hasta el cofre", desc: "Un objeto, pero el mar no perdona.", effects: [{ t: "damage", pct: 0.12 }, { t: "item", rarity: "raro" }] },
        { label: "Recoger los restos", desc: "Oro entre los maderos.", effects: [{ t: "gold", v: 35 }] },
        { label: "Dejarlo", desc: "El mar se queda lo que es suyo.", effects: [] }
      ]
    },
    {
      id: "pozo_huesos", name: "Pozo de Huesos", icon: "🕳️",
      text: "Un pozo profundo del que sube un olor dulzón. Algo brilla en el fondo, entre los huesos.",
      choices: [
        { label: "Descender", desc: "Peligro y recompensa.", effects: [{ t: "combat", tier: "elite", bonus: { gold: 40 } }] },
        { label: "Arrojar una moneda", desc: "Un gesto para los muertos.", effects: [{ t: "xp", v: 12 }] },
        { label: "Alejarte", desc: "Hay abismos que no llaman.", effects: [] }
      ]
    }
  ];

  /* ---------------- índices ---------------- */
  D.byId = {};
  const lists = ["classes", "scenarios", "themes", "difficulties", "lengths", "companions", "patrons",
    "curses", "relics", "perks", "weapons", "armors", "trinkets", "items", "potions", "enemies", "events"];
  for (const key of lists) {
    D.byId[key] = {};
    for (const item of D[key]) D.byId[key][item.id] = item;
  }
})();


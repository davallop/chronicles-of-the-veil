/* Narrative screens and English presentation layer. */
(function () {
  "use strict";
  const RPG=globalThis.RPG,D=RPG.data,E=RPG.engine,U=RPG.ui,esc=U.esc,pct=U.pct;

  const replacements=[
    ["Crónicas del Umbral","Chronicles of the Veil"],["Aventurero","Adventurer"],["Peregrino","Wanderer"],["Héroe","Hero"],["Leyenda","Legend"],
    ["Vida","Health"],["Ataque","Attack"],["Defensa","Defense"],["Crítico","Critical"],["Daño crítico","Critical damage"],["Daño crít.","Critical damage"],["Recurso","Resource"],["Oro","Gold"],["Pociones","Potions"],["Etapa","Scene"],
    ["Ronda ","Round "],["Jefe Final","Final Boss"],["Élite","Elite"],["Combate","Combat"],["Enemigos vivos","Living enemies"],["Criatura","Creature"],["Derrotado","Defeated"],
    ["Atacar","Attack"],["Daño básico","Basic damage"],["Defender","Defend"],["Escudo para este turno","Shield for this turn"],["disponibles","available"],["Huir","Flee"],["Pierdes las recompensas","Lose all rewards"],
    ["Consejo","Advice"],["El escudo se reinicia al comenzar tu turno.","Shield resets at the beginning of your turn."],["Elige un objetivo","Choose a target"],["Cancelar","Cancel"],
    ["Victoria","Victory"],["El polvo se asienta. Registras lo que queda entre los restos.","The dust settles. You search what remains."],["oro","gold"],["vida","health"],["poción de vida","health potion"],["Reliquia","Relic"],["Elige un botín","Choose one reward"],["Continuar sin objeto","Continue without an item"],
    ["Se equipará automáticamente","It will be equipped automatically"],["Sustituirá a ","It will replace "],["Subida de nivel","Level Up"],["Elige una mejora permanente.","Choose a permanent boon."],["Las mejoras se acumulan durante toda la partida. Elige según tu estilo.","Boons remain for the entire story. Choose what fits your role."],
    ["Cuesta ","Costs "],["Necesitas ","You need "],[" de oro"," gold"],["No ocurre nada.","Nothing happens."],["Resultado","Outcome"],["Continuar","Continue"],
    ["Poción","Potion"],["Vendido","Sold"],["Mercader Errante","Wandering Merchant"],["oro disponible","gold available"],["Salir de la tienda","Leave the market"],
    ["Fogata en el camino","A Fire Beside the Road"],["El fuego crepita y aleja a las alimañas. Tienes un momento para recuperarte antes de seguir.","The fire keeps the darkness away. You have time for one action before moving on."],
    ["Dormir","Sleep"],["Recupera ","Recover "],["Preparar pociones","Brew potions"],["Entrenar","Train"],["Reforzar defensa","Reinforce armor"],["Solo puedes elegir una opción. El descanso se consume.","Choose one action before returning to the story."],
    ["Cofre olvidado","Forgotten Chest"],["Tomar solo el oro","Take only the gold"],["Santuario de los Antiguos","Shrine of the Ancients"],["Solo puedes recibir un don.","You may receive one gift."],
    ["Bolsa y personaje","Inventory and Character"],["Desequipar","Unequip"],["Vacío","Empty"],["Equipar","Equip"],["La bolsa está vacía.","Your inventory is empty."],["Sin pociones.","No potions."],["Ninguna","None"],["Estadísticas","Attributes"],["Bolsa","Inventory"],["Mejoras","Boons"],
    ["Resumen de la expedición","Story Summary"],["Clase","Class"],["Nivel","Level"],["Enemigos","Enemies"],["Daño infligido","Damage dealt"],["Escenario","Setting"],["Temática","Enemy theme"],["Dificultad","Difficulty"],["Duración","Length"],["Compañero","Companion"],["Patrón","Patron"],["Maldiciones","Curses"],["Estados actuales","Current conditions"],["Ninguno.","None."],
    ["Menú de partida","Game Menu"],["La partida está guardada. ¿Qué quieres hacer?","Your story is saved. What would you like to do?"],["Seguir jugando","Keep playing"],["Volver a la expedición.","Return to the story."],["Ir al menú principal","Main menu"],["Tu progreso queda guardado. Podrás continuar desde el menú.","Your progress is saved and can be continued later."],["Abandonar la partida","Abandon story"],["Pierdes el progreso actual y cuenta como derrota.","This ends the current story as a defeat."],
    ["¿Abandonar la expedición?","Abandon this story?"],["Esta acción no se puede deshacer. La partida actual se perderá y contará como una derrota en tus estadísticas.","This cannot be undone. The current story will end and count as a defeat."],["Abandonar","Abandon"],["Cerrar","Close"],
    ["Compra realizada.","Purchase completed."],["Ya está vendido.","It has already been sold."],["No tienes oro suficiente.","You do not have enough gold."],["Objeto equipado.","Item equipped."],["Objeto guardado en la bolsa.","Item returned to the inventory."],
    ["El combate comienza.","Combat begins."],["Un enemigo élite bloquea tu camino.","An elite enemy blocks your path."],["¡El jefe final aparece!","The final foe appears!"],["Recuperas el aliento antes del enfrentamiento final.","You catch your breath before the final confrontation."],
    ["¡Has ganado el combate!","You won the battle!"],["No puedes huir del jefe final.","You cannot flee from the final foe."],["Logras escapar del combate.","You escape the battle."],["No logras escapar.","You fail to escape."],
    ["Turno de ","Turn of "],["Usas ","You use "],["Atacas a ","You attack "],["Recibes ","You receive "],[" de daño"," damage"],["Ganas ","You gain "],["Te curas ","You heal "],["Se fortalece","Strengthens"],["Se protege","Defends"],["Se cura","Heals"],["Ataque","Attack"],["Drenaje","Drain"],["Maleficio","Hex"],["Apoya a un aliado","Supports an ally"],
    ["Esquiva","Dodge"],["Bloqueado","Blocked"],["Ninguna.","None."],["por turno","per turn"],["Cura tras combate","Post-combat healing"],["Daño recibido","Damage received"],["Coste de habilidad","Skill cost"],["Precios","Prices"],
    ["Sin estados alterados.","No active conditions."],["genera ","generates "],["actúa en ","acts in "],[" turno(s)"," turn(s)"],
    ["Observa la intención enemiga: los ataques marcados en rojo son peligrosos.","Watch enemy intentions: attacks marked in red are dangerous."],[" cancela un objetivo."," cancels targeting."],
    ["Común","Common"],["Raro","Rare"],["Épico","Epic"],["Legendario","Legendary"],["CONSEJO","ADVICE"],
    [" usa "," uses "],["Regeneras ","You regenerate "],[" te causa "," deals you "],["Regeneración te cura ","Regeneration heals you for "],
    ["Una fuerza antigua te devuelve a la vida.","An ancient force returns you to life."],["¡Renaces con el 35% de tu health!","You return with 35% health!"],["Caes en combate","You fall in battle"],
    [" cae derrotado."," is defeated."],[" se enfurece. Su poder aumenta."," becomes enraged. Its power grows."],[" esquiva el attack."," dodges the attack."],
    ["Robas ","You drain "],[" te devuelve "," reflects "],[" bloqueado"," blocked"],[" absorbido"," absorbed"],["Tu escudo absorbe el golpe","Your shield absorbs the blow"],
    [" afecta al enemy."," affects the enemy."],["Eliminas un efecto negativo.","You remove one negative condition."],["Te pones en guardia y ganas ","You brace yourself and gain "],
    ["Recuperas ","You recover "],["Te purificas y recuperas ","You cleanse yourself and recover "],["No puedes huir","You cannot flee"],["Logras escapar","You escape"],["No logras escapar","You fail to escape"],
    [" te otorga "," grants you "],[" marca a "," marks "],["El impacto te tambalea.","The impact staggers you."],["Sufres ","You suffer "],[" se cura "," heals "],[" regenera "," regenerates "],
    [" sufre "," suffers "],[" está aturdido y pierde su turno."," is stunned and loses its turn."],["Esquivas el primer attack de ","You dodge the first attack from "],["Esquivas el attack de ","You dodge the attack from "],
    [" fortalece a "," empowers "],[" se protege con "," protects itself with "],[" de escudo."," shield."],["Don inicial","Starting Boon"],
    ["Descanso","Rest"],["Alquimia","Alchemy"],["Entrenamiento","Training"],["Fortificación","Fortification"],["Preparas 2 potions de health y 1 potion aleatoria.","You prepare 2 health potions and 1 random potion."],
    ["Preparas 2 pociones de health y 1 poción aleatoria.","You prepare 2 health potions and 1 random potion."],["2 pociones de health y 1 aleatoria.","2 health potions and 1 random potion."],
    [" de health."," health."],[" de attack permanente."," permanent attack."],[" de ataque permanente."," permanent attack."],[" de defense permanente."," permanent defense."],[" de defensa permanente."," permanent defense."],["Regen. recurso","Resource regeneration"],["Pociones extra","Extra potions"],["Escudo inicial","Starting shield"],
    ["«Tengo reliquias de lugares que ya no existen. Todo tiene un precio, amigo mío.»","“I carry relics from places that no longer exist. Everything has a price.”"]
    ,["Tu expedición comienza. ¡Buena suerte!","Your story begins."],["Expedición aleatoria:","Random story:"],[" en "," in "],["Partida recuperada.","Story restored."],["No hay ninguna partida guardada.","There is no saved story."],["Puedes elegir como máximo 2 maldiciones.","You may choose at most 2 curses."],["No puedes elegir esa ruta ahora.","That choice is not available."],["Obtienes ","You obtain "],[" ataca a "," attacks "]
  ];
  function english(html){
    html=String(html==null?"":html);
    for(const [a,b] of replacements) html=html.split(a).join(b);
    html=html.replace(/(\d+) etapas/g,"$1 scenes").replace(/0 scenes/g,"Unlimited scenes");
    html=html.replace(/Etapa \d+\/\d+/g,m=>m.replace("Etapa","Scene"));
    html=html.replace(/Nv\. /g,"Lv. ");
    html=html.replace(/([A-Za-zÀ-ÿ' -]+) recibe (\d+) damage/g,"$1 takes $2 damage");
    html=html.replace(/Se cura (\d+)/g,"Heals $1").replace(/te cura (\d+)/g,"heals you for $1");
    return html;
  }
  U.english=english;
  U.RARITY={comun:"Common",raro:"Rare",epico:"Epic",legendario:"Legendary"};
  const baseToast=U.toast;
  U.toast=function(text,cls){baseToast(english(text),cls);};

  U.defaultCreation=function(){
    const relics=U.rollRelics();
    return {name:"Adventurer",classId:"guerrero",scenarioId:"bosque",themeId:"mixed",difficultyId:"aventurero",lengthId:"infinite",companionId:"lobo",patronId:"guerra",curseIds:[],relicId:relics[0]?relics[0].id:"corazon",relicOptions:relics};
  };

  U.renderMenu=function(){
    const m=E.getMeta(),has=(RPG.game&&!RPG.game.finished)||E.hasSave();
    return `<div class="menu-hero">
      <div class="menu-sigil">📖</div><div class="eyebrow">A NARRATIVE SOLO ROLE-PLAYING GAME</div>
      <h1 class="title-gradient">Chronicles of the Veil</h1>
      <p class="subtitle">Enter a living story. Speak, investigate, lie, help, flee or fight. Every scene presents a situation; your decisions shape what happens next.</p>
      <div class="menu-actions">
        <button class="btn btn-primary btn-lg" data-action="open-creation">✒️ Create a Story</button>
        <button class="btn btn-lg" data-action="new-random">🎲 Random Story</button>
        ${has?'<button class="btn btn-lg btn-ghost" data-action="continue-game">▶️ Continue Story</button>':""}
        <button class="btn btn-ghost" data-action="open-help">📖 How to Play</button>
      </div>
      <div class="menu-meta"><span><b>${m.runs}</b> stories</span><span><b>${m.victories}</b> completed</span><span><b>${m.bestScore}</b> best score</span><span><b>${m.kills}</b> enemies defeated</span></div>
      <div class="menu-features">
        <div class="feature"><span class="fi">💬</span><b>Choices before combat</b><span>Most situations can be approached through words, patience, risk, mercy or violence.</span></div>
        <div class="feature"><span class="fi">🧭</span><b>Consequences that persist</b><span>Your promises, secrets and betrayals are remembered by the story.</span></div>
        <div class="feature"><span class="fi">∞</span><b>No forced length</b><span>Unlimited is the default. Fixed lengths are available only when you explicitly choose one.</span></div>
      </div>
      <div class="menu-footer">SINGLE PLAYER · OFFLINE · AUTOMATIC LOCAL SAVING</div>
    </div>`;
  };

  const baseCreation=U.renderCreation;
  U.renderCreation=function(){
    let h=english(baseCreation());
    h=h.replace(/Forja tu leyenda/g,"Shape Your Story").replace(/Tu expedición/g,"Your Story")
      .replace(/Nombre del héroe/g,"Character Name").replace(/Así te recordará el mundo/g,"How the world will remember you")
      .replace(/Escribe un nombre.../g,"Enter a name...").replace(/Paso 1 de 1/g,"STORY SETUP")
      .replace(/Clase/g,"Class").replace(/Resource, pasiva y 4 habilidades propias/g,"Unique resource, passive and four combat abilities")
      .replace(/Pasiva/g,"Passive").replace(/Setting inicial/g,"Starting Setting").replace(/Dónde comienza tu viaje/g,"Where the story opens")
      .replace(/Enemy theme de enemigos/g,"Enemy Theme").replace(/Quién te saldrá al paso/g,"Who may threaten you")
      .replace(/Enemigos /g,"Enemies: ").replace(/ daño/g," damage").replace(/ puntos/g," score").replace(/Cuántas etapas hasta el jefe/g,"Unlimited by default, or choose a stated finale")
      .replace(/Actúa solo, cada ciertos turnos/g,"Acts independently during combat").replace(/Una bendición permanente/g,"A permanent blessing")
      .replace(/Relic inicial/g,"Starting Relic").replace(/Elige una de tres/g,"Choose one of three").replace(/Etapas/g,"Scenes")
      .replace(/opcional, máx\. 2/g,"optional, max. 2").replace(/Más riesgo, más recompensa/g,"More risk, more reward")
      .replace(/Comenzar expedición/g,"Begin Story").replace(/Aleatorizarlo todo/g,"Randomize Everything").replace(/Todo aleatorio/g,"Randomize All")
      .replace(/Volver al menú/g,"Back to Menu").replace(/← Menú/g,"← Menu")
      .replace(/La partida se guarda automáticamente\. Puedes continuar más tarde\./g,"The story saves automatically. You can continue later.")
      .replace(/Modo Legend: sin resurrecciones\. Una derrota termina la partida\./g,"Legend mode: no resurrection. Defeat ends the story.");
    return h;
  };

  U.renderStory=function(g){
    const s=E.currentStory(g),st=g.story,len=D.byId.lengths[g.build.lengthId],scen=D.byId.scenarios[g.build.scenarioId];
    const count=st.turn+1,progress=len.storyTurns?Math.min(100,Math.round(count/len.storyTurns*100)):null;
    return `<div class="story-screen screen-narrow">
      <div class="story-context">
        <span>${scen.icon} ${esc(scen.name)}</span><span class="spacer"></span>
        <span>${len.storyTurns?`Scene ${count} of ${len.storyTurns}`:`Scene ${count} · Unlimited story`}</span>
      </div>
      ${progress!=null?`<div class="bar story-progress"><div class="bar-fill xp" style="width:${progress}%"></div></div>`:""}
      <article class="story-card">
        <div class="story-icon">${s.icon}</div>
        <div class="eyebrow">${esc(s.chapter||"WHAT HAPPENS NEXT?")}</div>
        ${s.questTitle?`<div class="story-quest-title">${esc(s.questTitle)}</div>`:""}
        <h1>${esc(s.title)}</h1>
        <p class="story-text">${esc(s.text)}</p>
      </article>
      <div class="story-question">What do you decide to do?</div>
      <div class="story-choices">${s.choices.map((c,i)=>`<button class="story-choice" data-action="story-choice" data-idx="${i}">
        <span class="choice-number">${i+1}</span><span><b>${esc(c.label)}</b><small>${esc(c.desc||"")}</small>${c.check?`<em class="ability-check">🎲 ${esc(c.check.skill)} · ${esc(c.check.ability.toUpperCase())} · DC ${c.check.dc}</em>`:""}</span><span class="arrow">→</span>
      </button>`).join("")}</div>
      ${Object.keys(st.flags||{}).length?`<p class="tiny muted center mt-2">The story remembers ${Object.keys(st.flags).length} of your previous decisions.</p>`:""}
    </div>`;
  };
  U.renderStoryResult=function(g){
    const p=g.pending||{},lines=p.lines||[];
    return `<div class="story-screen screen-narrow">
      <article class="story-card result">
        <div class="story-icon">${p.icon||"📜"}</div><div class="eyebrow">${esc(p.chapter||"CONSEQUENCE")}</div>
        ${p.questTitle?`<div class="story-quest-title">${esc(p.questTitle)} · CONSEQUENCE</div>`:""}
        <h1>${esc(p.title||"The story continues")}</h1>
        <p class="story-text">${esc(p.outcome||"Your choice changes the road ahead.")}</p>
      </article>
      ${lines.length?`<div class="result-box">${lines.map(l=>`<div class="result-line"><span class="ri">${l.icon||"•"}</span><span>${esc(l.text)}</span></div>`).join("")}</div>`:""}
      <div class="center mt-3"><button class="btn btn-primary btn-lg" data-action="story-continue">Continue the story →</button></div>
    </div>`;
  };

  const baseRenderGame=U.renderGame;
  U.renderGame=function(){
    const g=RPG.game;
    if(g&&g.screen==="story") return U.renderHud(g)+U.renderStory(g);
    if(g&&g.screen==="storyResult") return U.renderHud(g)+U.renderStoryResult(g);
    return english(baseRenderGame());
  };
  U.renderMap=function(g){return U.renderStory(g);};

  U.renderHud=function(g){
    const s=E.stats(g),p=g.player,cls=D.byId.classes[p.classId],xp=E.xpProgress(g),pots=Object.values(p.potions||{}).reduce((a,n)=>a+n,0);
    const turn=g.story?g.story.turn+1:g.stageIndex+1,len=D.byId.lengths[g.build.lengthId];
    return `<div class="hud"><div class="hud-id"><div class="hud-avatar" style="color:${cls.color}">${cls.icon}</div><div><b>${esc(p.name)}</b><span>${esc(cls.name)} · Lv. ${p.level}</span></div></div>
      <div class="hud-hp"><div class="bar-label"><span>Health</span><b>${Math.max(0,Math.ceil(p.hp))}/${s.maxHp}</b></div>${U.hpBar(p.hp,s.maxHp,"hp")}</div>
      <div class="hud-hp" style="min-width:118px"><div class="bar-label"><span>XP</span><b>${xp.into}/${xp.need}</b></div><div class="bar" style="height:6px"><div class="bar-fill xp" style="width:${xp.pct*100}%"></div></div></div>
      <span class="hud-chip" title="Gold">🪙 <b>${p.gold}</b></span><span class="hud-chip" title="Potions">🧪 <b>${pots}</b></span>
      <span class="hud-chip">📖 ${len.storyTurns?`Scene ${turn}/${len.storyTurns}`:`Scene ${turn} · ∞`}</span><span class="spacer"></span>
      <button class="btn btn-icon" data-action="open-bag" title="Inventory">🎒</button><button class="btn btn-icon" data-action="open-build" title="Story summary">📜</button><button class="btn btn-icon" data-action="open-menu" title="Menu">☰</button></div>`;
  };

  const baseModal=U.renderModal;
  U.renderModal=function(){
    if(U.modal&&U.modal.type==="help"){
      return `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>How to Play</h2><button class="btn btn-icon" data-action="close-modal">✕</button></div>
      <div class="help-body"><h3>A role-playing story</h3><p>Each scene describes a situation and asks what your character does. Choose according to the role you want to play. Decisions can grant allies, reveal secrets, cost health, begin combat or bring the story to an ending.</p>
      <h3>No fixed rounds</h3><p><b>Unlimited</b> is the default length. It has no predetermined number of scenes and continues until your character dies or reaches a narrative conclusion. Short Tale, Long Adventure and Epic Chronicle state their exact scene count and culminate in a finale.</p>
      <h3>Combat is a consequence</h3><p>Violence is only one possible response. When combat begins, enemies reveal their intentions. Basic attacks generate class resource; skills spend it; defending grants temporary shield.</p>
      <h3>Persistent consequences</h3><p>The story remembers important acts. Mercy, lies, bargains and discoveries may strengthen later choices or affect an ending.</p>
      <h3>Combat keys</h3><p><span class="kbd">A</span> attack · <span class="kbd">1</span>-<span class="kbd">4</span> skills · <span class="kbd">D</span> defend · <span class="kbd">Q</span> potions · <span class="kbd">Esc</span> cancel.</p>
      <h3>Saving</h3><p>The game saves automatically after every choice.</p></div></div></div>`;
    }
    let h=english(baseModal());
    if(U.modal&&U.modal.type==="build"&&RPG.game&&RPG.game.player.abilities){
      const a=RPG.game.player.abilities;
      const names={strength:"STR",dexterity:"DEX",constitution:"CON",intelligence:"INT",wisdom:"WIS",charisma:"CHA"};
      const sheet=`<div class="divider-label">Ability Scores</div><div class="summary-stats">${Object.keys(names).map(k=>`<div class="summary-stat"><span>${names[k]}</span><b>${a[k]} <small>${Math.floor((a[k]-10)/2)>=0?"+":""}${Math.floor((a[k]-10)/2)}</small></b></div>`).join("")}</div>`;
      h=h.replace('<div class="divider-label">Relics</div>',sheet+'<div class="divider-label">Relics</div>');
      const scene=(RPG.game.story?RPG.game.story.turn+1:1),len=D.byId.lengths[RPG.game.build.lengthId];
      h=h.replace(/(<span>Scene<\/span><b>)[^<]*(<\/b>)/,`$1${len&&len.storyTurns?scene+"/"+len.storyTurns:scene+" · Unlimited"}$2`);
    }
    return h;
  };

  for(const key of ["renderCombat","renderRewards","renderPerk","renderEvent","renderEventResult","renderShop","renderRest","renderTreasure","renderShrine"]){
    const fn=U[key]; if(fn) U[key]=function(){return english(fn.apply(U,arguments));};
  }

  U.renderEnd=function(g){
    const win=!!g.victory,score=g.score||E.score(g),m=E.getMeta(),st=g.story||{};
    return `<div class="end-screen ${win?"":"defeat"} screen-narrow"><span class="end-sigil">${win?"📖":g.abandoned?"🏳️":"☠️"}</span>
      <div class="eyebrow">${win?"STORY COMPLETE":g.abandoned?"STORY ABANDONED":"THE STORY ENDS HERE"}</div>
      <h1 class="${win?"title-gradient":""}">${win?"Your ending is written":"You have fallen"}</h1>
      <p class="subtitle">${esc(st.ending||(win?`${g.player.name} reached the end of this tale.`:`${g.player.name}'s journey ended before its final answer.`))}</p>
      <div class="end-stats"><div class="end-stat"><b>${score}</b><span>Score</span></div><div class="end-stat"><b>${g.player.level}</b><span>Level</span></div><div class="end-stat"><b>${g.stats.kills}</b><span>Enemies</span></div><div class="end-stat"><b>${g.stats.nodes}</b><span>Scenes</span></div><div class="end-stat"><b>${Object.keys(st.flags||{}).length}</b><span>Remembered choices</span></div></div>
      <div class="row-wrap center mt-3" style="justify-content:center"><button class="btn btn-primary" data-action="rematch">🔁 Retell This Story</button><button class="btn" data-action="new-run">✒️ New Story</button><button class="btn btn-ghost" data-action="new-random">🎲 Random</button><button class="btn btn-ghost" data-action="back-to-menu">🏠 Menu</button></div>
      <p class="tiny muted mt-3">Best score: ${m.bestScore} · Stories played: ${m.runs} · Completed: ${m.victories}</p></div>`;
  };

  U.actions["story-choice"]=ds=>{if(E.storyChoice(RPG.game,Number(ds.idx))){U.targeting=null;U.render();}};
  U.actions["story-continue"]=()=>{E.storyContinue(RPG.game);U.render();};

  const oldRandom=U.actions["new-random"];
  U.actions["new-random"]=()=>{oldRandom();};
  const oldContinue=U.actions["continue-game"];
  U.actions["continue-game"]=()=>{oldContinue();};
  const oldStart=U.actions["start-game"];
  U.actions["start-game"]=()=>{oldStart();};

  const baseAfter=U.afterRender;
  U.afterRender=function(){
    baseAfter();
    document.documentElement.lang="en";

    /* Let the scenery follow the current setting, including its live
       preview during character creation. A few scene words can further
       refine the atmosphere when the story moves indoors. */
    const game=RPG.game;
    const scenario=(U.mode==="creation"&&U.creation&&U.creation.scenarioId)
      ||(game&&game.build&&game.build.scenarioId)
      ||"bosque";
    document.body.dataset.realm=scenario;

    const visibleStory=document.querySelector(".story-card");
    const sceneText=visibleStory?visibleStory.textContent.toLowerCase():"";
    let scene="";
    if(/\b(cave|cavern|tunnel|mine|underground|grotto)\b/.test(sceneText)) scene="cave";
    else if(/\b(tavern|inn|market|street|city|palace|court|village)\b/.test(sceneText)) scene="settlement";
    else if(/\b(temple|crypt|tomb|catacomb|altar)\b/.test(sceneText)) scene="sanctum";
    else if(/\b(ship|sky|cloud|island|cliff)\b/.test(sceneText)) scene="heights";
    if(scene) document.body.dataset.scene=scene;
    else delete document.body.dataset.scene;
  };
})();

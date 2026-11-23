/* English content and narrative scenes. */
(function () {
  "use strict";
  const D = globalThis.RPG.data;

  const patch = (list, values) => list.forEach(x => Object.assign(x, values[x.id] || {}));

  patch(D.classes, {
    guerrero:{name:"Warrior",tagline:"Steel, fury and endurance",desc:"A veteran who can endure punishment and turn pain into strength.",passive:{name:"Unstoppable Rage",desc:"+25% damage while below 40% health.",key:"lowHpDmg",value:.25}},
    mago:{name:"Mage",tagline:"Fire, frost and forbidden knowledge",desc:"Fragile but devastating. Controls the field with elemental magic.",passive:{name:"Arcane Affinity",desc:"+15% skill damage.",key:"skillDmg",value:.15}},
    arquero:{name:"Ranger",tagline:"Lethal precision at range",desc:"A patient hunter who marks prey and finishes it with critical shots.",passive:{name:"Hawk Eye",desc:"+8% critical chance.",key:"crit",value:.08}},
    picaro:{name:"Rogue",tagline:"Poison, shadows and dirty tricks",desc:"An opportunist who poisons, weakens and vanishes before retaliation.",passive:{name:"Opportunist",desc:"+20% damage against afflicted enemies.",key:"debuffDmg",value:.20}},
    clerigo:{name:"Cleric",tagline:"Light, faith and divine judgment",desc:"A resilient healer who punishes the wicked with sacred light.",passive:{name:"Fervor",desc:"+25% to all healing.",key:"healMult",value:.25}},
    druida:{name:"Druid",tagline:"Untamed nature",desc:"A guardian who transforms, poisons foes and regenerates over time.",passive:{name:"Barkskin",desc:"+2 permanent defense.",key:"def",value:2}}
  });
  const skills = {
    tajo:["Brutal Slash","Deal 175% physical damage."],grito:["War Cry","+20% damage for 3 turns and 10 shield."],torbellino:["Whirlwind","Strike every enemy and inflict bleeding."],ejecucion:["Execution","Deal 260% damage, stronger against wounded enemies."],
    bola:["Fireball","Deal 155% fire damage and burn the target."],escarcha:["Frost Lance","Deal 125% ice damage and slow the target."],escudo:["Arcane Shield","Gain 18 shield and regeneration for 3 turns."],nova:["Arcane Nova","Strike every enemy and make them vulnerable."],
    certero:["Aimed Shot","Deal 155% damage with +25% critical chance."],lluvia:["Rain of Arrows","Damage every enemy and make them bleed."],marca:["Hunter's Mark","Mark a foe to make it receive +25% damage."],paso:["Shadow Step","Dodge the next attack and recover 12 focus."],
    punalada:["Backstab","Deal 135% damage and inflict bleeding."],veneno:["Lethal Poison","Apply a powerful poison that ignores armor."],golpe:["Cheap Shot","Damage and weaken the enemy for 2 turns."],sombra:["Vanish","Dodge the next attack and recover 10 energy."],
    luz:["Healing Light","Restore 24% maximum health and remove one debuff."],castigo:["Holy Smite","Deal 150% holy damage and heal 6 health."],bendicion:["Blessing","Gain 12 shield and regeneration for 3 turns."],juicio:["Judgment","Strike and weaken every enemy."],
    forma:["Wild Shape","+25% damage and +20% defense for 3 turns."],zarzas:["Thorns","Damage and poison every enemy."],regeneracion:["Regeneration","Heal 8 and regenerate for 3 turns."],colmillo:["Fang","Deal 170% damage and heal for 40% of damage dealt."]
  };
  D.classes.forEach(c => {
    const resources={rage:"Rage",mana:"Mana",focus:"Focus",energy:"Energy",faith:"Faith",essence:"Essence"};
    c.res.name=resources[c.res.id]||c.res.id;
    c.skills.forEach(s=>{if(skills[s.id]){s.name=skills[s.id][0];s.desc=skills[s.id][1];}});
  });

  patch(D.scenarios, {
    bosque:{name:"Gloamwood",desc:"An ancient forest where paths move when nobody watches.",tip:"The woods remember every promise.",greeting:"Rain whispers through black leaves as your story begins."},
    desierto:{name:"Ashen Desert",desc:"Ruined roads, buried kingdoms and merciless heat.",tip:"Water and trust are equally scarce.",greeting:"A red dawn rises over dunes filled with forgotten bones."},
    cripta:{name:"Frozen Crypt",desc:"A buried necropolis locked beneath eternal ice.",tip:"The dead still keep their oaths.",greeting:"The sealed gate groans open and frozen air speaks your name."},
    pantano:{name:"Cursed Mire",desc:"A drowned land of witch-lights, bargains and hungry reeds.",tip:"Nothing offered freely is truly free.",greeting:"Black water ripples around your boots though there is no wind."},
    islas:{name:"Shattered Sky Isles",desc:"Floating islands joined by bridges, airships and unstable magic.",tip:"A single wrong step can become a very long fall.",greeting:"Clouds part beneath your feet as distant bells begin to ring."},
    ruinas:{name:"The Broken City",desc:"A fallen capital divided by gangs, ghosts and old loyalties.",tip:"Every ruin belongs to someone.",greeting:"A thousand dark windows watch you enter the abandoned avenue."}
  });
  patch(D.themes, {
    magic:{name:"Arcane",desc:"Elementals, spellcasters and creatures warped by magic."},
    human:{name:"Human",desc:"Bandits, cultists, soldiers and ambitious tyrants."},
    beast:{name:"Beasts",desc:"Wolves, spiders, chimeras and savage predators."},
    undead:{name:"Undead",desc:"Skeletons, specters, necromancers and liches."},
    construct:{name:"Constructs",desc:"Golems, automata and ancient guardians."},
    mixed:{name:"Mixed",desc:"An unpredictable mixture of every enemy family."}
  });
  patch(D.difficulties, {
    peregrino:{name:"Wanderer",desc:"Story-focused. Weaker enemies and one second chance."},
    aventurero:{name:"Adventurer",desc:"A balanced challenge for a lone hero."},
    heroe:{name:"Hero",desc:"Dangerous foes and costly decisions."},
    leyenda:{name:"Legend",desc:"Brutal enemies, no mercy and no resurrection."}
  });
  D.lengths = [
    {id:"infinite",name:"Unlimited",icon:"∞",desc:"No fixed ending. The story continues until death or a narrative conclusion.",stages:0,storyTurns:0,xpMult:1},
    {id:"short",name:"Short Tale",icon:"📖",desc:"A focused story that reaches its finale after 12 scenes.",stages:12,storyTurns:12,xpMult:1.25},
    {id:"standard",name:"Long Adventure",icon:"🗺️",desc:"A broad adventure with a finale after 24 scenes.",stages:24,storyTurns:24,xpMult:1.1},
    {id:"epic",name:"Epic Chronicle",icon:"👑",desc:"A long-form saga with a finale after 40 scenes.",stages:40,storyTurns:40,xpMult:1}
  ];

  patch(D.companions, {
    ninguno:{name:"No Companion",desc:"You travel alone. Nobody else can be hurt."},
    lobo:{name:"Spectral Wolf",desc:"Every 2 turns it bites the weakest enemy."},
    espiritu:{name:"Healing Spirit",desc:"Every 3 turns it restores 9% of your maximum health."},
    mercenario:{name:"Mercenary",desc:"Every 2 turns it grants 8 shield."},
    cuervo:{name:"Augur Raven",desc:"+25% gold. Every 3 turns it marks the strongest enemy."},
    golem:{name:"Lesser Golem",desc:"+12 maximum health. Every 3 turns it grants 12 shield."}
  });
  patch(D.patrons, {
    guerra:{name:"God of War",desc:"+12% damage dealt."},vida:{name:"Mother of Life",desc:"+18% maximum health and +20% healing."},
    fortuna:{name:"Lord of Fortune",desc:"+60% gold and 20% lower shop prices."},destino:{name:"Weaver of Fate",desc:"+6% critical chance and +15% critical damage."},
    sombra:{name:"Lord of Shadows",desc:"Enemies begin combat with 12% less health."},sabio:{name:"The Wandering Sage",desc:"+25% experience and one extra starting boon."}
  });
  patch(D.curses, {
    sangre:{name:"Weak Blood",desc:"-18% maximum health. Gain an extra relic."},fragil:{name:"Fragile Flesh",desc:"Enemies deal +15% damage. Gain an extra boon."},
    pobreza:{name:"Vow of Poverty",desc:"Begin without gold. Gain a rare item."},inquieto:{name:"Restless Sleep",desc:"Rest heals half as much. Gain +25% experience and 80 gold."},
    condenado:{name:"Condemned Soul",desc:"No resurrection. Gain +12% damage and 100 gold."},codicia:{name:"Eternal Greed",desc:"Prices rise by 40%. Begin with 100 extra gold."}
  });

  const relicNames={corazon:"Stone Heart",anillo:"Ring of Power",ambar:"Ebony Amulet",halcon:"Hawk Eye",grimorio:"Lesser Grimoire",moneda:"Ancient Coin",fenix:"Phoenix Feather",botas:"Light Boots",caliz:"Feast Chalice",sangre:"Blood Talisman",espejo:"Broken Mirror",semilla:"Ancestral Seed",verdugo:"Executioner's Axe",errante:"Wanderer's Map",titan:"Titan Heart"};
  D.relics.forEach(x=>{x.name=relicNames[x.id]||"Ancient Relic";x.desc="A permanent relic whose power is shown by its attributes.";});
  const perkNames={vigor:"Vigor",poder:"Might",piel:"Iron Skin",precision:"Precision",brutalidad:"Brutality",conduccion:"Channeling",vampiro:"Bloodthirst",espinas:"Thorns",codicia:"Greed",erudito:"Scholar",alquimista:"Alchemist",baluarte:"Bulwark",raudo:"Quickened",afortunado:"Lucky",superviviente:"Survivor",duelista:"Duelist",verdugo:"Executioner",golpe:"First Strike",furia:"Blood Fury",guardia:"Arcane Guard",frugal:"Efficiency",regeneracion:"Regeneration"};
  D.perks.forEach(x=>{x.name=perkNames[x.id]||"Heroic Boon";x.desc="A permanent improvement for the rest of this story.";});

  const itemNames={
    daga:"Rusty Dagger",espada_corta:"Short Sword",hacha_lenador:"Woodcutter's Axe",arco_cazador:"Hunter's Bow",baston_roble:"Oak Staff",mandoble:"Greatsword",maza_pesada:"Heavy Mace",cetro_arcano:"Arcane Scepter",hoja_sombras:"Shadow Blade",martillo_guerra:"Warhammer",lanza_alba:"Dawn Spear",filo_alba:"Dawn Edge",vara_archimago:"Archmage's Staff",espada_heroe:"Hero's Sword",
    ropa_lino:"Linen Garb",cota_cuero:"Leather Coat",tunica_aprendiz:"Apprentice Robe",malla_hierro:"Iron Mail",capa_seda:"Silk Cloak",cuero_tachonado:"Studded Leather",placas:"Plate Armor",manto_runico:"Runic Mantle",coraza_obsidiana:"Obsidian Cuirass",coraza_coloso:"Colossus Plate",sudario:"Spectral Shroud",piel_dragon:"Dragonhide",
    ambar_trinket:"Amber Amulet",anillo_hierro:"Iron Ring",talisman_suerte:"Lucky Charm",piedra_mana:"Mana Stone",colmillo_lobo:"Wolf Fang",ojo_oraculo:"Oracle Eye",corazon_titan:"Titan Heart",brazal_furia:"Fury Bracer",sello_vacio:"Void Seal",fenix_relic:"Phoenix Relic",anillo_tirano:"Tyrant's Ring"
  };
  [...D.weapons,...D.armors,...D.trinkets].forEach(x=>{x.name=itemNames[x.id]||"Unknown Equipment";x.desc="Equipment recovered during your travels.";});
  patch(D.potions, {
    vida:{name:"Health Potion",desc:"Restore 30% of maximum health."},mana:{name:"Resource Potion",desc:"Restore 70 class resource."},
    antidoto:{name:"Antidote",desc:"Remove every debuff and heal 10%."},fuerza:{name:"Strength Elixir",desc:"+30% damage for 3 turns."},
    bomba:{name:"Fire Bomb",desc:"Deal 35 damage to every enemy."},escudo:{name:"Shield Potion",desc:"Gain 30 shield."}
  });
  D.itemSlots.weapon.name="Weapon"; D.itemSlots.armor.name="Armor"; D.itemSlots.trinket.name="Trinket";

  const enemyNames={imp:"Arcane Imp",golem_cristal:"Crystal Golem",fuego_fatuo:"Will-o'-Wisp",runa_viva:"Living Rune",bandido:"Bandit",maton:"Thug",degollador:"Cutthroat",cultista:"Cultist",arquero_bandido:"Bandit Archer",lobo:"Grey Wolf",arana:"Giant Spider",jabali:"Furious Boar",arpia:"Harpy",esqueleto:"Skeleton",zombi:"Zombie",espectro:"Specter",ghoul:"Ghoul",automata:"Automaton",gargola:"Gargoyle",centinela:"Sentinel",chatarra:"Living Scrap",archimago:"Renegade Archmage",elemental_tormenta:"Storm Elemental",capitan_bandido:"Bandit Captain",inquisidor:"Inquisitor",oso_colosal:"Colossal Bear",quimera:"Chimera",caballero_muerto:"Death Knight",nigromante:"Necromancer",coloso_hierro:"Iron Colossus",vigia_antiguo:"Ancient Watcher",ojo_vacio:"The Eye of the Void",senor_runas:"Lord of Runes",rey_bandido:"Bandit King",general_caido:"Fallen General",devorador:"Soul Devourer",tirano_bestias:"Tyrant of Beasts",lich:"The Lich",rey_esqueleto:"Skeleton King",titan_obsidiana:"Obsidian Titan",corazon_forja:"Heart of the Forge"};
  D.enemies.forEach(x=>{x.name=enemyNames[x.id]||"Nameless Foe";x.desc="A dangerous presence stands between you and your chosen path.";});
  const intentNames={
    Golpe:"Strike","Golpe Pesado":"Heavy Blow",Rugido:"Roar",Descarga:"Arcane Bolt",Maleficio:"Hex",Barrera:"Barrier",Drenar:"Drain",
    "Ráfaga":"Flurry",Mordisco:"Bite",Zarpazo:"Claw",Esquivar:"Evade",Embate:"Slam",Fortificar:"Fortify",Provocar:"Taunt",
    "Sanar Aliado":"Heal Ally",Bendecir:"Bless",Maldición:"Curse","Golpe Colosal":"Colossal Blow",Barrido:"Sweep",
    "Grito de Guerra":"War Cry",Terror:"Terror",Devorar:"Devour"
  };
  Object.values(D.roles).flat().forEach(x=>{x.name=intentNames[x.name]||x.name;});
  D.enemies.forEach(x=>{
    if(x.signature){
      const byType={attack:"Special Attack",debuff:"Dark Omen",buff:"Gather Power",defend:"Iron Guard",drain:"Life Drain",heal:"Dark Renewal"};
      x.signature.name=byType[x.signature.type]||"Unnatural Power";
    }
  });
  const statusNames={burn:"Burning",poison:"Poison",bleed:"Bleeding",weak:"Weakness",vulnerable:"Vulnerable",slow:"Slowed",mark:"Marked",stun:"Stunned",strength:"Strength",fortify:"Fortified",regen:"Regeneration",dodge:"Dodge"};
  Object.keys(D.statuses).forEach(k=>{if(statusNames[k])D.statuses[k].name=statusNames[k];});

  D.storyScenes = [
    {id:"enchanted_tavern",icon:"🍺",title:"The Enchanted Tavern",text:"You sit in a tavern where the candles burn blue. Every patron is staring at you. Conversations have stopped, but nobody explains why.",choices:[
      {label:"Stand up and attack everyone",desc:"Turn suspicion into open violence.",outcome:"You overturn the table and draw your weapon. Chairs scrape back as the entire room reaches for steel.",effects:[{t:"combat",tier:"normal"}]},
      {label:"Remain seated",desc:"Wait and pretend you have noticed nothing.",outcome:"One by one, the patrons return to their seats. They still watch you from the corners of their eyes, but you are beginning to pass unnoticed.",effects:[{t:"xp",v:12},{t:"flag",id:"tavern_patience"}]},
      {label:"Stand up and leave",desc:"Put distance between yourself and the room.",outcome:"Several patrons wait a moment before following you into the rain. Their hands remain hidden beneath their cloaks.",effects:[{t:"combat",tier:"normal",chance:.65},{t:"gold",v:12}]},
      {label:"Ask why they are staring",desc:"Risk an honest conversation.",outcome:"The innkeeper whispers that your face appears in a prophecy painted beneath the floorboards.",effects:[{t:"flag",id:"prophecy"},{t:"xp",v:18}]}
    ]},
    {id:"child_bridge",icon:"🌉",title:"The Child on the Bridge",text:"A child blocks the only bridge across a black river. Behind them waits a creature made of reeds, perfectly still.",choices:[
      {label:"Lead the child across",desc:"Trust that the creature will not move.",outcome:"The reed-creature bows as you pass. The child gives you a silver button and disappears at the far bank.",effects:[{t:"gold",v:22},{t:"flag",id:"reed_mercy"}]},
      {label:"Attack the creature",desc:"Remove the threat before crossing.",outcome:"The thing unfolds to twice your height and charges.",effects:[{t:"combat",tier:"elite"}]},
      {label:"Question the child",desc:"Nothing here is as simple as it appears.",outcome:"The child admits that the creature is their mother. They are waiting for somebody to break an old curse.",effects:[{t:"xp",v:20},{t:"flag",id:"reed_secret"}]},
      {label:"Find another crossing",desc:"Avoid both strangers.",outcome:"Hours later you cross through freezing water and lose supplies to the current.",effects:[{t:"damage",pct:.08},{t:"gold",v:-10}]}
    ]},
    {id:"masked_feast",icon:"🎭",title:"The Feast Without Names",text:"Masked nobles invite you to a moonlit feast. They insist that every guest must surrender a true name before eating.",choices:[
      {label:"Give them your real name",desc:"Accept the rules of the feast.",outcome:"The food tastes of childhood. When you leave, the nobles know more about you than they should.",effects:[{t:"heal",pct:.3},{t:"flag",id:"name_given"}]},
      {label:"Invent a name",desc:"Play their game without yielding yourself.",outcome:"The masks laugh. Your lie is good enough to earn a place at the table and a purse beneath your plate.",effects:[{t:"gold",v:35},{t:"xp",v:10}]},
      {label:"Refuse and observe",desc:"Learn what happens to the other guests.",outcome:"At midnight, every surrendered name is written into a book bound in pale leather.",effects:[{t:"flag",id:"name_book"},{t:"xp",v:25}]},
      {label:"Steal the book",desc:"Free the names and anger the hosts.",outcome:"The masks crack. Something ancient screams from every throat in the hall.",effects:[{t:"combat",tier:"elite"},{t:"item",rarity:"raro"}]}
    ]},
    {id:"wounded_knight",icon:"🩹",title:"A Knight in the Ditch",text:"A wounded knight lies beside a broken banner. They ask for water, then warn you that their pursuers are close.",choices:[
      {label:"Treat the wound",desc:"Spend time helping a stranger.",outcome:"The knight survives and swears to speak your name at the royal court.",effects:[{t:"gold",v:-8},{t:"xp",v:24},{t:"flag",id:"knight_saved"}]},
      {label:"Hide nearby and wait",desc:"Use the knight as bait.",outcome:"Three hunters arrive. You learn who sent them before they notice you.",effects:[{t:"xp",v:16},{t:"combat",tier:"normal",chance:.45}]},
      {label:"Take the knight's purse",desc:"The dead have little use for money.",outcome:"The knight watches in silence as you take the coins. You hear their curse long after walking away.",effects:[{t:"gold",v:45},{t:"flag",id:"knight_betrayed"}]},
      {label:"Carry them with you",desc:"Accept a dangerous burden.",outcome:"The road becomes slower, but the knight reveals a hidden cache along the way.",effects:[{t:"item",rarity:"raro"},{t:"damage",pct:.05}]}
    ]},
    {id:"whispering_door",icon:"🚪",title:"The Door That Whispers",text:"A freestanding door waits beside the road. From the other side, your own voice begs you not to open it.",choices:[
      {label:"Open the door",desc:"Face whatever knows your voice.",outcome:"You step into a room that contains a memory you tried to forget.",effects:[{t:"damage",pct:.1},{t:"xp",v:30},{t:"item",rarity:"epico"}]},
      {label:"Answer the voice",desc:"Ask what lies beyond.",outcome:"Your other self gives you one warning: do not trust the next crown you see.",effects:[{t:"flag",id:"crown_warning"},{t:"xp",v:18}]},
      {label:"Destroy the door",desc:"Some thresholds should remain closed.",outcome:"Splinters become black birds. They attack until the frame finally stops screaming.",effects:[{t:"combat",tier:"normal"}]},
      {label:"Walk away",desc:"Refuse the invitation.",outcome:"The door follows at a distance until sunrise, then vanishes.",effects:[]}
    ]},
    {id:"hanging_cage",icon:"⛓️",title:"The Hanging Cage",text:"A cage hangs from an ancient tree. Its prisoner claims to be a harmless scholar; the warning carved below calls them a shapeshifter.",choices:[
      {label:"Cut the cage down",desc:"Believe the prisoner.",outcome:"The scholar keeps their shape and teaches you a forgotten defensive stance.",effects:[{t:"def",v:1},{t:"flag",id:"scholar_freed"}]},
      {label:"Demand proof",desc:"Words are not enough.",outcome:"The prisoner recites a secret from your past that no stranger should know.",effects:[{t:"xp",v:22},{t:"flag",id:"scholar_doubt"}]},
      {label:"Set the cage on fire",desc:"Trust the warning.",outcome:"The prisoner changes shape as the flames rise. It breaks free, furious and wounded.",effects:[{t:"combat",tier:"elite"}]},
      {label:"Leave it hanging",desc:"This judgment is not yours.",outcome:"The prisoner's pleading follows you for miles.",effects:[{t:"xp",v:6}]}
    ]},
    {id:"silent_market",icon:"🏪",title:"The Silent Market",text:"Merchants trade beneath white tents without speaking. Prices are written in chalk; secrets are accepted as currency.",choices:[
      {label:"Browse the stalls",desc:"Spend your gold on useful supplies.",outcome:"A masked merchant gestures toward a collection of road-worn treasures.",effects:[{t:"shop"}]},
      {label:"Sell a harmless secret",desc:"Trade a small truth for coin.",outcome:"You whisper the name of your childhood pet. The merchant pays far too much for it.",effects:[{t:"gold",v:35},{t:"flag",id:"secret_sold"}]},
      {label:"Listen to other trades",desc:"Gather information without buying.",outcome:"You learn that somebody has placed a reward on a traveler matching your description.",effects:[{t:"xp",v:18},{t:"flag",id:"hunted"}]},
      {label:"Leave before being noticed",desc:"Keep your secrets.",outcome:"A merchant slips a blank card into your pocket as you depart.",effects:[{t:"gold",v:8}]}
    ]},
    {id:"campfire_stranger",icon:"🔥",title:"A Stranger at Your Fire",text:"At dusk, a hooded traveler asks to share your fire. Their shadow points in the wrong direction.",choices:[
      {label:"Offer food and conversation",desc:"Hospitality may reveal the truth.",outcome:"The stranger tells you a story that changes each time you interrupt. By dawn, your wounds feel lighter.",effects:[{t:"heal",pct:.3},{t:"xp",v:12}]},
      {label:"Ask about the shadow",desc:"Address the impossible thing directly.",outcome:"The stranger smiles and admits that the shadow belongs to someone hunting them.",effects:[{t:"flag",id:"shadow_guest"},{t:"xp",v:20}]},
      {label:"Drive the stranger away",desc:"Protect your camp.",outcome:"The hood falls back. The face beneath it has no eyes.",effects:[{t:"combat",tier:"normal"}]},
      {label:"Take the first watch together",desc:"Rest, but do not lower your guard.",outcome:"Nothing attacks. You wake with an unfamiliar charm beside the ashes.",effects:[{t:"rest"}]}
    ]},
    {id:"bell_tower",icon:"🔔",title:"The Bell Beneath the Earth",text:"A bell rings below your feet. With each toll, nearby stones briefly show the names of people who have not died yet.",choices:[
      {label:"Dig toward the bell",desc:"Find the source of the prophecy.",outcome:"You uncover a buried chapel guarded by something that refuses to die.",effects:[{t:"combat",tier:"elite"},{t:"item",rarity:"epico"}]},
      {label:"Search for your own name",desc:"Learn whether the stone has chosen you.",outcome:"Your name appears, then changes into a date that has not yet arrived.",effects:[{t:"xp",v:28},{t:"flag",id:"death_date"}]},
      {label:"Break the marked stones",desc:"Reject the prophecy.",outcome:"The bell stops. A warm pulse of strength travels through your weapon arm.",effects:[{t:"atk",v:1}]},
      {label:"Leave before the next toll",desc:"Some knowledge only harms.",outcome:"The ringing continues in your dreams.",effects:[]}
    ]},
    {id:"two_graves",icon:"⚰️",title:"Two Open Graves",text:"Two graves wait beside the road. One bears your name. The other bears the name of your companion—or the words 'the one you abandoned' if you travel alone.",choices:[
      {label:"Fill both graves",desc:"Refuse the omen through hard work.",outcome:"By sunset the earth is level again. You feel strangely renewed.",effects:[{t:"heal",pct:.2},{t:"xp",v:15}]},
      {label:"Lie in your grave",desc:"See what the earth remembers.",outcome:"For one breath you hear every possible ending to your story.",effects:[{t:"damage",pct:.12},{t:"xp",v:35},{t:"flag",id:"heard_endings"}]},
      {label:"Wait for the gravedigger",desc:"Somebody prepared this place.",outcome:"At midnight a pale gravedigger arrives carrying your portrait.",effects:[{t:"combat",tier:"normal"}]},
      {label:"Walk away quickly",desc:"Do not dignify the omen.",outcome:"When you look back, both graves are gone.",effects:[]}
    ]},
    {id:"crown_road",icon:"👑",title:"A Crown in the Road",text:"A gold crown lies in fresh mud. No footprints approach it, yet you hear a crowd cheering whenever you look directly at it.",minTurn:8,choices:[
      {label:"Put on the crown",desc:"Accept whatever kingdom is calling.",outcome:"For an instant you stand before kneeling thousands. Then the vision collapses and something enters your thoughts.",effects:[{t:"atk",v:2},{t:"damage",pct:.15},{t:"flag",id:"crowned"}]},
      {label:"Wrap it and carry it",desc:"Keep the crown without wearing it.",outcome:"The cheering follows from inside your pack, but the gold may prove valuable.",effects:[{t:"gold",v:70},{t:"flag",id:"crown_carried"}]},
      {label:"Bury it",desc:"Heed the danger.",outcome:"The earth refuses the crown three times before finally closing over it.",effects:[{t:"xp",v:26}]},
      {label:"Place it on a scarecrow",desc:"Offer the kingdom another ruler.",outcome:"The scarecrow bows. By morning it and the crown are gone.",effects:[{t:"item",rarity:"raro"}]}
    ]},
    {id:"returning_village",icon:"🏘️",title:"The Village That Remembers You",text:"Villagers greet you by name and celebrate your return, though you have never been here. A family insists that you vanished ten years ago.",minTurn:5,choices:[
      {label:"Play along",desc:"Discover who they think you are.",outcome:"Inside 'your' old room you find letters in your own handwriting.",effects:[{t:"xp",v:30},{t:"flag",id:"other_life"}]},
      {label:"Tell them the truth",desc:"Refuse a life that is not yours.",outcome:"The celebration turns to grief. An old woman gives you the sword their hero left behind.",effects:[{t:"item",rarity:"raro"}]},
      {label:"Ask about your disappearance",desc:"Follow the mystery.",outcome:"They point toward a well sealed with chains. Something inside whispers your name.",effects:[{t:"combat",tier:"elite"}]},
      {label:"Leave immediately",desc:"Do not become trapped in another life.",outcome:"The road behind you fades, taking the village with it.",effects:[]}
    ]},
    {id:"last_letter",icon:"✉️",title:"A Letter From Tomorrow",text:"A raven delivers a letter written in your hand. It describes the choice you are about to make and begs you to choose differently.",minTurn:10,choices:[
      {label:"Obey the letter",desc:"Trust your future self.",outcome:"You take the path marked in the margin and avoid an ambush. A hidden cache waits beneath a stone.",effects:[{t:"gold",v:45},{t:"item",rarity:"raro"}]},
      {label:"Do the opposite",desc:"Refuse to be controlled by prophecy.",outcome:"The predicted ambush happens exactly as written.",effects:[{t:"combat",tier:"elite"}]},
      {label:"Burn the letter",desc:"Leave tomorrow unwritten.",outcome:"The smoke forms a map of roads that do not yet exist.",effects:[{t:"xp",v:28}]},
      {label:"Write a reply",desc:"Ask your future self one question.",outcome:"The raven returns with two words: 'Keep going.'",effects:[{t:"heal",pct:.2},{t:"flag",id:"future_reply"}]}
    ]},
    {id:"quiet_morning",icon:"🌅",title:"A Quiet Morning",text:"For once, no monster waits and no prophecy calls your name. There is only pale sunlight, birdsong and a road leading onward.",choices:[
      {label:"Rest until noon",desc:"Take the peace while it lasts.",outcome:"You sleep without dreams and wake with steadier hands.",effects:[{t:"rest"}]},
      {label:"Practice your craft",desc:"Use the calm to improve.",outcome:"Repetition turns uncertainty into instinct.",effects:[{t:"xp",v:18}]},
      {label:"Search the roadside",desc:"Even peaceful places hide things.",outcome:"Beneath a milestone you find a traveler's forgotten purse.",effects:[{t:"gold",v:24}]},
      {label:"Continue without delay",desc:"The story waits ahead.",outcome:"By sunset the road has carried you somewhere new.",effects:[]}
    ]},
    {id:"finale",icon:"🌌",title:"The Heart of the Story",finale:true,text:"Every road you followed bends toward the same place: a gate of living darkness. Beyond it waits the force that has shaped your journey. You may confront it, bargain with it, or turn away.",choices:[
      {label:"Cross the gate with weapon drawn",desc:"End the story through one final battle.",outcome:"The gate closes behind you. The master of this tale rises to meet its defiant hero.",effects:[{t:"combat",tier:"boss",finalBoss:true}]},
      {label:"Offer your memories as payment",desc:"Win without steel, but lose part of yourself.",outcome:"The darkness accepts every painful memory you carry. The gate opens, and the world beyond is finally free.",effects:[{t:"end",victory:true,ending:"You saved the realm by surrendering the memories that made you who you were."}]},
      {label:"Use everything you have learned",desc:"Attempt to unmake the gate's power.",outcome:"Names, promises and secrets gathered on the road become a weapon stronger than iron.",effects:[{t:"skillEnding"}]},
      {label:"Turn away",desc:"Let this story remain unfinished.",outcome:"You choose life over legend. The gate waits for another hero.",effects:[{t:"end",victory:false,ending:"You survived, but left the darkness undefeated."}]}
    ]},
    {id:"open_ending",icon:"🕊️",title:"A Road Home",text:"After so many trials, you find a road that unmistakably leads home. Taking it would end your wandering. The unknown still calls from the opposite direction.",minTurn:20,rare:true,infiniteOnly:true,choices:[
      {label:"Go home",desc:"End the adventure alive and changed.",outcome:"You return with scars, stories and enough truth to last a lifetime.",effects:[{t:"end",victory:true,ending:"You chose your own ending and returned home alive."}]},
      {label:"Keep wandering",desc:"Your story is not finished.",outcome:"You turn away from home. The horizon opens before you once more.",effects:[{t:"xp",v:20},{t:"flag",id:"refused_home"}]}
    ]}
  ];

  D.storyScenes.push(
    {id:"gloamwood_hunt",icon:"🌲",title:"The Hunt Between the Trees",scenarios:["bosque"],text:"The trees shift behind you, closing the path home. Horns sound in the distance, and a white stag with a human voice asks you to hide it from the approaching hunt.",choices:[
      {label:"Hide the stag",desc:"Defy the hunters and protect the creature.",outcome:"You cover its tracks with your own. The hunters find you instead.",effects:[{t:"combat",tier:"normal"},{t:"flag",id:"stag_saved"}]},
      {label:"Ask what it did",desc:"Hear both sides before choosing.",outcome:"The stag admits it stole a noble's memories to prevent a war.",effects:[{t:"xp",v:24},{t:"flag",id:"stolen_memories"}]},
      {label:"Lead the hunters to it",desc:"The reward may be worth the betrayal.",outcome:"The hunters pay in old silver. The stag speaks your name as they drag it away.",effects:[{t:"gold",v:55},{t:"flag",id:"stag_betrayed"}]},
      {label:"Challenge the hunt's master",desc:"Settle the matter by force.",outcome:"A horned rider steps from the trees and accepts your challenge.",effects:[{t:"combat",tier:"elite"}]}
    ]},
    {id:"desert_caravan",icon:"🏜️",title:"The Caravan of Empty Wagons",scenarios:["desierto"],text:"A caravan crosses the dunes without cargo, drivers or footprints. A sealed water jug rests on the leading wagon while voices whisper from inside it.",choices:[
      {label:"Open the jug",desc:"Free whatever has been sealed inside.",outcome:"A desert spirit erupts into the sky, laughing as it leaves a jewel in your hands.",effects:[{t:"item",rarity:"raro"},{t:"flag",id:"desert_spirit"}]},
      {label:"Drink from it",desc:"Risk the whispering water.",outcome:"The water is cold and impossibly sweet. It heals you, but now the whispers know your name.",effects:[{t:"heal",pct:.35},{t:"flag",id:"jug_whispers"}]},
      {label:"Follow the caravan",desc:"Discover where the empty wagons are going.",outcome:"At sunset they descend into a buried city whose guards still patrol the gate.",effects:[{t:"combat",tier:"normal"},{t:"xp",v:18}]},
      {label:"Let it pass",desc:"The desert contains enough dangers.",outcome:"Hours later, you find gold coins in the caravan's tracks.",effects:[{t:"gold",v:25}]}
    ]},
    {id:"crypt_oath",icon:"⚰️",title:"The Frozen Oath",scenarios:["cripta"],text:"An armored corpse kneels before an icebound altar. It cannot move, but its voice asks you to complete the oath it failed to keep.",choices:[
      {label:"Swear the oath",desc:"Promise to carry its duty onward.",outcome:"Frost marks your palm. The dead knight's strength passes into your arm.",effects:[{t:"atk",v:1},{t:"flag",id:"frozen_oath"}]},
      {label:"Ask what the oath requires",desc:"Never promise blindly.",outcome:"It asks you to destroy the crown buried in the lowest tomb.",effects:[{t:"xp",v:22},{t:"flag",id:"crypt_crown"}]},
      {label:"Break the altar",desc:"Release the corpse by ending the ritual.",outcome:"The ice shatters, but so does the knight's patience.",effects:[{t:"combat",tier:"elite"}]},
      {label:"Offer a final prayer",desc:"Give the dead what peace you can.",outcome:"The voice fades with gratitude, leaving an old key behind.",effects:[{t:"gold",v:30},{t:"xp",v:12}]}
    ]},
    {id:"mire_witch",icon:"🌫️",title:"The Witch in the Reed House",scenarios:["pantano"],text:"A house walks across the mire on long wooden legs. Its witch offers to remove one regret from your past, but she wants a future promise in return.",choices:[
      {label:"Accept the bargain",desc:"Lose a regret and owe an unknown favor.",outcome:"One painful memory vanishes. In its place remains the certainty that the witch will find you again.",effects:[{t:"heal",pct:.4},{t:"flag",id:"witch_debt"}]},
      {label:"Negotiate the price",desc:"Try to bind the bargain with careful words.",outcome:"The witch agrees to accept gold instead of a promise and seems disappointed by your caution.",effects:[{t:"gold",v:-25},{t:"xp",v:20}]},
      {label:"Ask for directions only",desc:"Keep the exchange ordinary.",outcome:"She points toward safe ground, then charges you for the gesture.",effects:[{t:"gold",v:-8},{t:"xp",v:12}]},
      {label:"Threaten the witch",desc:"Take what you need without bargaining.",outcome:"The walking house crouches like a hunting animal.",effects:[{t:"combat",tier:"elite"}]}
    ]},
    {id:"skyship",icon:"🏝️",title:"The Falling Skyship",scenarios:["islas"],text:"A burning skyship drifts below the island's edge. Its crew hangs from ropes while a locked cargo chest slides toward open air.",choices:[
      {label:"Save the crew",desc:"People matter more than cargo.",outcome:"You anchor the ropes and pull until your hands bleed. The captain promises you passage whenever you need it.",effects:[{t:"damage",pct:.06},{t:"xp",v:28},{t:"flag",id:"sky_captain"}]},
      {label:"Catch the chest",desc:"The cargo may be priceless.",outcome:"You secure the chest as the ship disappears into cloud. Nobody sees what you chose.",effects:[{t:"item",rarity:"epico"},{t:"flag",id:"crew_abandoned"}]},
      {label:"Leap aboard",desc:"Try to save both ship and crew.",outcome:"Fire elementals crawl from the engine as you land on the deck.",effects:[{t:"combat",tier:"elite"},{t:"gold",v:35}]},
      {label:"Signal a nearby island",desc:"Find help instead of acting alone.",outcome:"A rescue glider arrives just before the final rope breaks.",effects:[{t:"xp",v:20}]}
    ]},
    {id:"ruined_court",icon:"🏚️",title:"The Court of Broken Statues",scenarios:["ruinas"],text:"In the ruined palace, stone courtiers reenact the final trial of their kingdom. They mistake you for the missing judge and demand a verdict.",choices:[
      {label:"Pardon the accused queen",desc:"Choose mercy for a crime you do not understand.",outcome:"Half the statues cheer; the others draw stone blades.",effects:[{t:"combat",tier:"normal"},{t:"flag",id:"queen_pardoned"}]},
      {label:"Declare her guilty",desc:"Honor the law recorded on the walls.",outcome:"The queen's statue crumbles, revealing a royal coffer beneath the throne.",effects:[{t:"gold",v:60},{t:"flag",id:"queen_condemned"}]},
      {label:"Demand to hear the evidence",desc:"Treat the dead trial seriously.",outcome:"The testimony lasts for hours and reveals that both sides rewrote history.",effects:[{t:"xp",v:30},{t:"flag",id:"court_truth"}]},
      {label:"Refuse to judge",desc:"You are not part of their dead kingdom.",outcome:"The statues call refusal a verdict of its own and allow you to leave.",effects:[]}
    ]},
    {id:"prophecy_returns",icon:"🕯️",title:"The Prophecy Finds You",requiresFlag:"prophecy",minTurn:4,text:"The innkeeper from the enchanted tavern waits beside the road, though the tavern is hundreds of miles away. They have torn up the prophecy—except for the final line.",choices:[
      {label:"Read the final line",desc:"Know what the prophecy expects from you.",outcome:"It says that you will open a door no living hand can close.",effects:[{t:"xp",v:28},{t:"flag",id:"final_line"}]},
      {label:"Burn it unread",desc:"Refuse the role written for you.",outcome:"The parchment screams once, then burns with a clean white flame.",effects:[{t:"atk",v:1}]},
      {label:"Ask who wrote it",desc:"Find the author behind your fate.",outcome:"The innkeeper points at your own handwriting beneath the final line.",effects:[{t:"xp",v:22},{t:"flag",id:"wrote_prophecy"}]}
    ]},
    {id:"knight_returns",icon:"🛡️",title:"A Debt Repaid",requiresFlag:"knight_saved",minTurn:5,text:"The knight you saved rides out of the rain with three allies. They have been searching for you, and the hunters who wounded them are close behind.",choices:[
      {label:"Stand together",desc:"Face the hunters beside your new allies.",outcome:"The knight forms a shield wall at your side. For once, you do not fight alone.",effects:[{t:"combat",tier:"elite"},{t:"item",rarity:"raro"}]},
      {label:"Use their hidden road",desc:"Avoid battle and accept their guidance.",outcome:"They lead you through an abandoned royal passage and leave you with provisions.",effects:[{t:"heal",pct:.3},{t:"gold",v:25}]},
      {label:"Ask them to protect others",desc:"Send the debt where it is needed most.",outcome:"The knight salutes and turns toward a village threatened by the same hunters.",effects:[{t:"xp",v:32},{t:"flag",id:"debt_gifted"}]}
    ]}
  );

  /* Connected quest lines. Each one is played as a sequence of chapters:
     hook, investigation, complication, revelation, confrontation and aftermath. */
  D.storyQuests = {
    bosque: [
      {id:"rootless_village",title:"The Village Without Roots",patron:"Mara, the last village elder",place:"the walking village of Alderhollow",threat:"the Briar King",goal:"return the stolen village to the mortal world",clue:"a trail of doorways growing from living trees",secret:"Mara once invited the Briar King in to save her people from a famine",relic:"the village bell"},
      {id:"moonless_hunt",title:"The Moonless Hunt",patron:"Edrin, a hunter who has lost his shadow",place:"the silver clearing at the forest's heart",threat:"the Pale Huntmaster",goal:"end a hunt that steals one villager every new moon",clue:"hoofprints that appear only in reflections",secret:"Edrin was once the Huntmaster's willing herald",relic:"the horn of the first hunt"},
      {id:"black_spring",title:"The Poisoned Spring",patron:"Sister Rowan, keeper of the woodland shrine",place:"the spring beneath the oldest oak",threat:"the Saint of Worms",goal:"cleanse the water before every settlement falls ill",clue:"black flowers blooming wherever the poisoned water flows",secret:"the shrine was built over the saint's forgotten grave",relic:"a cup carved from living amber"}
    ],
    desierto: [
      {id:"buried_sultan",title:"The Sultan Beneath the Sand",patron:"Nahla, an exiled royal cartographer",place:"the buried palace of Qasr Ilyun",threat:"the Sandbound Sultan",goal:"prevent an ancient army from waking beneath the dunes",clue:"a road of blue stones revealed only at noon",secret:"Nahla carries the blood needed to command the sleeping army",relic:"the sapphire seal of Qasr Ilyun"},
      {id:"stolen_river",title:"The Stolen River",patron:"Tarek, spokesman for three dying caravans",place:"the canyon where the river once flowed",threat:"the Glass Vizier",goal:"restore the vanished river before the wells run dry",clue:"fish skeletons made of mirrored glass",secret:"the caravans sold the river's true name to the Vizier years ago",relic:"a clay jar containing the river's voice"},
      {id:"sun_auction",title:"The Auction of the Sun",patron:"Ilyra, a blind astronomer",place:"the market that appears during a solar eclipse",threat:"the Brass Collector",goal:"recover a stolen fragment of daylight",clue:"shadows pointing toward the wrong horizon",secret:"Ilyra originally sold the fragment to predict the future",relic:"a coin warm enough to burn stone"}
    ],
    cripta: [
      {id:"last_bell",title:"The Last Bell of Winter",patron:"Brother Caldus, a monk preserved in ice",place:"the cathedral below the frozen tombs",threat:"the Bell-Eater",goal:"ring the final funeral bell and let the dead rest",clue:"echoes that freeze words in the air",secret:"Caldus silenced the bell to keep one beloved soul from passing on",relic:"the iron tongue of the funeral bell"},
      {id:"nameless_queen",title:"The Queen With No Name",patron:"a ghost calling herself the royal archivist",place:"the throne hall sealed behind seven epitaphs",threat:"the Nameless Queen",goal:"discover and speak the queen's stolen name",clue:"portraits whose inscriptions have been scratched away",secret:"the archivist erased the name to steal the crown",relic:"a crown of blue funeral glass"},
      {id:"warm_grave",title:"The Grave That Burns",patron:"Vey, a gravedigger who has never seen daylight",place:"the lowest chamber of the necropolis",threat:"the Ember Lich",goal:"extinguish a grave fire that is raising the frozen dead",clue:"meltwater flowing upward through the crypt",secret:"Vey has been feeding memories to the fire to keep warm",relic:"a coal containing a human heartbeat"}
    ],
    pantano: [
      {id:"drowned_wedding",title:"The Drowned Wedding",patron:"Old Nessa, ferryman of the drowned road",place:"the chapel beneath the black water",threat:"the Bride of Reeds",goal:"stop a wedding procession that claims a living spouse each night",clue:"wet footprints leading away from locked homes",secret:"Nessa promised the first victim to the Bride decades ago",relic:"a ring woven from silver reeds"},
      {id:"borrowed_faces",title:"The Village of Borrowed Faces",patron:"a child wearing a wooden mask",place:"the stilt village of Mirewake",threat:"the Skin-Taker",goal:"return the villagers' stolen faces",clue:"reflections that move before their owners",secret:"the child is the Skin-Taker's abandoned heir",relic:"a mirror that remembers every face"},
      {id:"witch_debt",title:"The Witch's Oldest Debt",patron:"Mother Brume, the oldest witch in the mire",place:"the island that surfaces once every thirteen years",threat:"the Crooked Judge",goal:"destroy a contract that binds every witch-born child",clue:"legal runes carved into the shells of swamp turtles",secret:"Mother Brume wrote the original contract",relic:"a quill cut from the Judge's shadow"}
    ],
    islas: [
      {id:"falling_island",title:"The Island That Is Falling",patron:"Captain Vale of the rescue skyship Resolute",place:"the fractured island of Caelum",threat:"the Gravity Choir",goal:"keep the island from falling onto the cities below",clue:"stones that sing as they rise into the air",secret:"Vale's crew damaged the island while mining its heart",relic:"a compass that points toward the sky"},
      {id:"storm_library",title:"The Library Inside the Storm",patron:"Professor Elian, a scholar made partly of lightning",place:"the library hidden in an eternal thunderhead",threat:"the Index of Forbidden Names",goal:"recover a book that is rewriting people out of history",clue:"lightning that spells missing names",secret:"Elian asked the Index to erase his greatest mistake",relic:"a book whose pages are clouds"},
      {id:"silent_airship",title:"The Silent Airship",patron:"a speaking navigation crystal recovered from wreckage",place:"the royal airship Eidolon",threat:"the captain's immortal echo",goal:"discover why the ship returns empty every seven years",clue:"a distress signal transmitted backward through time",secret:"the crystal trapped the crew to prevent the ship from crashing",relic:"the Eidolon's golden helm"}
    ],
    ruinas: [
      {id:"throne_of_dust",title:"The Throne of Dust",patron:"Lio, a street courier carrying a royal signet",place:"the senate beneath the ruined palace",threat:"the Ash Regent",goal:"prevent the dead government from crowning a new tyrant",clue:"decrees appearing overnight on collapsed walls",secret:"Lio is the last surviving heir to the throne",relic:"the city's unbroken signet"},
      {id:"missing_district",title:"The District That Disappeared",patron:"Detective Sable, last officer of the city watch",place:"the vanished Lantern District",threat:"the Architect in Grey",goal:"bring an entire district back into the city",clue:"doors opening onto streets that no map records",secret:"Sable ordered the district sealed during the final night of the war",relic:"the master key to every city gate"},
      {id:"clockwork_revolt",title:"The Clockwork Revolt",patron:"Unit Seven, a damaged household automaton",place:"the abandoned royal foundry",threat:"the First Machine",goal:"stop the city's constructs from replacing its remaining citizens",clue:"metal copies of people seen walking at dawn",secret:"Unit Seven carries the First Machine's original command",relic:"a brass heart engraved with a human name"}
    ]
  };

  /* Classic tabletop-style ability checks. A failed check changes the
     consequence instead of blocking the player from trying. */
  const scene=id=>D.storyScenes.find(s=>s.id===id);
  Object.assign(scene("enchanted_tavern").choices[3],{
    check:{ability:"charisma",skill:"Persuasion",dc:12},
    failureOutcome:"Your question is answered with drawn steel. Whatever secret the room held, nobody intends to share it peacefully.",
    failureEffects:[{t:"combat",tier:"normal"}]
  });
  Object.assign(scene("child_bridge").choices[2],{
    check:{ability:"wisdom",skill:"Insight",dc:13},
    failureOutcome:"The child's answers contradict each other. While you search for the lie, the reed-creature lunges from the river.",
    failureEffects:[{t:"combat",tier:"normal"}]
  });
  Object.assign(scene("masked_feast").choices[1],{
    check:{ability:"charisma",skill:"Deception",dc:13},
    failureOutcome:"The nobles repeat your false name until it becomes a curse. You escape the table, but not unharmed.",
    failureEffects:[{t:"damage",pct:.12}]
  });
  Object.assign(scene("wounded_knight").choices[0],{
    check:{ability:"wisdom",skill:"Medicine",dc:11},
    failureOutcome:"You stop the bleeding, but your clumsy treatment causes terrible pain and consumes precious supplies.",
    failureEffects:[{t:"gold",v:-12},{t:"xp",v:8}]
  });
  Object.assign(scene("whispering_door").choices[1],{
    check:{ability:"intelligence",skill:"Arcana",dc:14},
    failureOutcome:"The voice answers in a language that makes your vision blur. You learn nothing and stagger away weakened.",
    failureEffects:[{t:"damage",pct:.1}]
  });
  Object.assign(scene("hanging_cage").choices[1],{
    check:{ability:"wisdom",skill:"Insight",dc:14},
    failureOutcome:"You mistake confidence for honesty. The prisoner changes shape the moment the lock opens.",
    failureEffects:[{t:"combat",tier:"elite"}]
  });
  Object.assign(scene("silent_market").choices[1],{
    check:{ability:"charisma",skill:"Deception",dc:12},
    failureOutcome:"The merchant recognizes that your secret is worthless and charges you for wasting their time.",
    failureEffects:[{t:"gold",v:-10}]
  });
  Object.assign(scene("bell_tower").choices[0],{
    check:{ability:"strength",skill:"Athletics",dc:13},
    failureOutcome:"The earth collapses while you dig. You escape the buried chapel with bruises and nothing else.",
    failureEffects:[{t:"damage",pct:.15}]
  });
  Object.assign(scene("returning_village").choices[0],{
    check:{ability:"charisma",skill:"Performance",dc:14},
    failureOutcome:"Your imitation fails. The villagers decide you are an impostor wearing their lost hero's face.",
    failureEffects:[{t:"combat",tier:"normal"}]
  });
  Object.assign(scene("last_letter").choices[0],{
    check:{ability:"intelligence",skill:"Investigation",dc:13},
    failureOutcome:"You misread the map in the margin and walk directly into the danger your future self tried to prevent.",
    failureEffects:[{t:"combat",tier:"normal"}]
  });
  Object.assign(scene("finale").choices[2],{
    check:{ability:"wisdom",skill:"Lore",dc:15},
    failureOutcome:"The truths you gathered refuse to fit together. The gate answers your failed ritual by summoning its master.",
    failureEffects:[{t:"combat",tier:"boss",finalBoss:true}]
  });
  Object.assign(scene("mire_witch").choices[1],{
    check:{ability:"charisma",skill:"Persuasion",dc:14},
    failureOutcome:"The witch laughs at your attempt to bargain and takes the payment without offering anything in return.",
    failureEffects:[{t:"gold",v:-25}]
  });
  Object.assign(scene("skyship").choices[3],{
    check:{ability:"intelligence",skill:"Investigation",dc:12},
    failureOutcome:"Your signal is misunderstood. The rescue glider arrives too late, and falling debris strikes you.",
    failureEffects:[{t:"damage",pct:.1}]
  });
  Object.assign(scene("ruined_court").choices[2],{
    check:{ability:"intelligence",skill:"History",dc:13},
    failureOutcome:"The contradictory testimony overwhelms you. The statues decide that confusion is proof of guilt—yours.",
    failureEffects:[{t:"combat",tier:"normal"}]
  });

  [D.relics,D.weapons,D.armors,D.trinkets,D.items||[]].flat().forEach(x=>{
    if(x&&x.rarity==="épico")x.rarity="epico";
    if(x&&x.rarity==="común")x.rarity="comun";
  });

  D.byId.lengths={}; D.lengths.forEach(x=>D.byId.lengths[x.id]=x);
})();

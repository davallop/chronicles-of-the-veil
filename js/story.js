/* Narrative progression layer. Combat remains a consequence, not the structure. */
(function () {
  "use strict";
  const RPG=globalThis.RPG, D=RPG.data, E=RPG.engine, H=RPG.engine._;
  const originalNewGame=E.newGame;
  const originalLoadSave=E.loadSave;
  const originalChoosePerk=E.choosePerk;

  function storyState(g){
    if(!g.story) g.story={turn:0,current:null,seen:[],flags:{},ending:null,lastOutcome:""};
    return g.story;
  }
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  function startQuest(g){
    const st=storyState(g),list=D.storyQuests[g.build.scenarioId]||D.storyQuests.bosque;
    const serial=st.questSerial||0,base=list[serial%list.length],cycle=Math.floor(serial/list.length);
    st.quest={id:base.id+(cycle?"_"+cycle:""),baseId:base.id,step:0,serial,cycle,data:base};
    st.questSerial=serial+1;
    return st.quest;
  }
  function qflag(q,name){return q.id+"_"+name;}
  function resolutionSummary(st,q){
    const has=n=>!!st.flags[qflag(q,n)],title=q.data.title;
    if(has("peace"))return `${title}, where you forced enemies into an uneasy peace`;
    if(has("outwitted"))return `${title}, where knowledge succeeded without bloodshed`;
    if(has("betrayed_patron"))return `${title}, where you sided with the power you were sent to stop`;
    if(has("defeated"))return `${title}, where you ended the threat through battle`;
    return `${title}, whose consequences still follow you`;
  }
  function questScene(g){
    const st=storyState(g),q=st.quest||startQuest(g),d=q.data,k=n=>qflag(q,n);
    const previous=st.lastQuestSummary?` Your last ordeal—${st.lastQuestSummary}—has already begun to shape your reputation.`:"";
    const returnLine=q.cycle?` You have faced an echo of this mystery before, but this time the signs are different.`:"";
    if(q.step===0)return {id:q.id+"_hook",icon:"📜",chapter:`Quest ${q.serial+1} · Chapter I`,questTitle:d.title,title:q.cycle?`The Return of ${d.title.replace(/^The /,"")}`:d.title,
      text:`At a place of temporary safety, you are approached by ${d.patron}, who asks you to ${d.goal}. The first lead points toward ${d.place}.${previous}${returnLine}`,
      choices:[
        {label:"Accept the task",desc:"Give your word and ask where to begin.",outcome:`You promise ${d.patron} that you will ${d.goal}. They describe ${d.clue}.`,effects:[{t:"flag",id:k("accepted")},{t:"xp",v:12}]},
        {label:"Question the patron's motives",desc:"Make sure you are not being used.",check:{ability:"wisdom",skill:"Insight",dc:12+Math.min(3,q.cycle)},outcome:`You notice fear beneath ${d.patron}'s story. They reluctantly admit that ${d.secret}.`,effects:[{t:"flag",id:k("knows_secret")},{t:"xp",v:18}],failureOutcome:`${d.patron} avoids your questions. Before you can press further, agents of ${d.threat} attack to silence the conversation.`,failureEffects:[{t:"combat",tier:"normal"},{t:"flag",id:k("ambushed")}]},
        {label:"Refuse the request",desc:"This conflict is not yours.",outcome:`You walk away, but ${d.threat} has already marked you as part of the affair. An ambush forces you back into the conflict.`,effects:[{t:"flag",id:k("reluctant")},{t:"combat",tier:"normal"}]},
        {label:"Agree, but on your own terms",desc:"Promise results, not obedience.",outcome:`${d.patron} accepts your independence and gives you a rough map leading toward ${d.clue}.`,effects:[{t:"flag",id:k("independent")},{t:"gold",v:15}]}
      ]};
    if(q.step===1)return {id:q.id+"_trail",icon:"🔎",chapter:`Quest ${q.serial+1} · Chapter II`,questTitle:d.title,title:"Following the First Lead",
      text:`Your search for ${d.clue} brings you closer to ${d.place}. The signs left by ${d.threat} are fresh, but someone has deliberately altered them. What you discover here will determine how prepared you are later.`,
      choices:[
        {label:"Examine every detail",desc:"Reconstruct what happened here.",check:{ability:"intelligence",skill:"Investigation",dc:13},outcome:`You separate the false trail from the real one and find proof connected to ${d.relic}.`,effects:[{t:"flag",id:k("evidence")},{t:"xp",v:22}],failureOutcome:`The false trail leads into a prepared trap. You escape, but the effort leaves you wounded.`,failureEffects:[{t:"damage",pct:.1},{t:"flag",id:k("misled")}]},
        {label:"Question the people nearby",desc:"Use conversation to piece together the route.",check:{ability:"charisma",skill:"Persuasion",dc:12},outcome:`A frightened witness saw servants of ${d.threat} carrying something toward ${d.place}.`,effects:[{t:"flag",id:k("witness")},{t:"xp",v:18}],failureOutcome:"Nobody trusts you enough to speak openly. You must continue with only the original clue.",failureEffects:[{t:"xp",v:6}]},
        {label:"Take the direct route",desc:"Move quickly and confront whoever blocks you.",outcome:`You force your way along the most obvious path. Scouts loyal to ${d.threat} try to stop you.`,effects:[{t:"flag",id:k("violent_trail")},{t:"combat",tier:"normal"}]},
        {label:"Circle around cautiously",desc:"Trade time for safety.",outcome:`The longer path reveals a concealed entrance to ${d.place} and signs that ${d.patron} has been here before.`,effects:[{t:"flag",id:k("hidden_entrance")},{t:"xp",v:14}]}
      ]};
    if(q.step===2)return {id:q.id+"_complication",icon:"🧭",chapter:`Quest ${q.serial+1} · Chapter III`,questTitle:d.title,title:"The Keeper of the Way",
      text:`Near the entrance to ${d.place}, you find a wounded keeper clutching a key marked with the symbol of ${d.relic}. They know a safe path inside, but hunters serving ${d.threat} are closing in.`,
      choices:[
        {label:"Protect the keeper",desc:"Stand between the wounded stranger and the hunters.",outcome:`You hold the path while the keeper reaches safety. In return, they explain how to approach ${d.relic}.`,effects:[{t:"combat",tier:"normal"},{t:"flag",id:k("keeper_saved")}]},
        {label:"Buy the key",desc:"Offer gold and avoid becoming involved.",outcome:"The keeper accepts the money with shame and gives you the key, but refuses to accompany you.",effects:[{t:"gold",v:-25},{t:"flag",id:k("has_key")}]},
        {label:"Slip past everyone",desc:"Reach the entrance without choosing a side.",check:{ability:"dexterity",skill:"Stealth",dc:13},outcome:`You enter ${d.place} through the concealed route without being seen.`,effects:[{t:"flag",id:k("unseen")},{t:"xp",v:20}],failureOutcome:`The hunters spot you beside the keeper and assume you are allies.`,failureEffects:[{t:"combat",tier:"normal"},{t:"flag",id:k("keeper_saved")}]},
        {label:"Interrogate the keeper",desc:"Demand the truth before offering help.",check:{ability:"charisma",skill:"Intimidation",dc:14},outcome:`The keeper reveals that ${d.secret}. They surrender the key and flee.`,effects:[{t:"flag",id:k("knows_secret")},{t:"flag",id:k("has_key")}],failureOutcome:"The keeper calls for help. Both hunters and guardian turn against you.",failureEffects:[{t:"combat",tier:"elite"},{t:"flag",id:k("keeper_lost")}]}
      ]};
    if(q.step===3){
      const entry=st.flags[k("keeper_saved")]?" The keeper you protected guides you past the first defenses.":st.flags[k("has_key")]?" The purchased key opens a route its former owner warned you not to take.":st.flags[k("unseen")]?" Because you entered unseen, nobody has had time to remove the evidence.":st.flags[k("keeper_lost")]?" The cost of forcing your way inside is still fresh in your mind.":"";
      return {id:q.id+"_revelation",icon:"🕯️",chapter:`Quest ${q.serial+1} · Chapter IV`,questTitle:d.title,title:"What Was Hidden",
      text:`Inside ${d.place}, the evidence becomes undeniable: ${d.secret}.${entry} At the center of it all rests ${d.relic}, the object linking ${d.patron} to ${d.threat}.`,
      choices:[
        {label:"Confront the patron with the truth",desc:"Send word before facing the enemy.",outcome:`Your message reaches ${d.patron}. Their reply is an apology and one final piece of advice about ${d.threat}.`,effects:[{t:"flag",id:k("patron_confronted")},{t:"xp",v:24}]},
        {label:"Keep the secret for now",desc:"Information is leverage.",outcome:`You conceal what you learned and study ${d.relic} for a weakness you can exploit.`,effects:[{t:"flag",id:k("secret_kept")},{t:"atk",v:1}]},
        {label:"Claim the relic's power",desc:"Use the object before confronting the threat.",outcome:`Power surges through you as you touch ${d.relic}. It leaves a wound, but also a weapon for the coming confrontation.`,effects:[{t:"damage",pct:.1},{t:"item",rarity:"epico"},{t:"flag",id:k("relic_claimed")}]},
        {label:"Destroy the evidence",desc:"Break the cycle instead of using it.",outcome:`You damage ${d.relic} and erase the clearest proof of ${d.patron}'s guilt. ${d.threat} feels the loss and begins to move.`,effects:[{t:"flag",id:k("relic_broken")},{t:"xp",v:20}]}
      ]};}
    if(q.step===4){
      const prepared=(st.flags[k("evidence")]?1:0)+(st.flags[k("witness")]?1:0)+(st.flags[k("knows_secret")]?1:0)+(st.flags[k("hidden_entrance")]?1:0)+(st.flags[k("keeper_saved")]?1:0);
      const dc=Math.max(10,14-Math.min(3,prepared));
      const memory=st.flags[k("knows_secret")]?` You already know the truth about ${d.secret}, so its first attempt to deceive you fails.`:st.flags[k("evidence")]?` The evidence gathered on the road contradicts part of its story.`:st.flags[k("violent_trail")]?` Your violent approach has given it time to prepare for you.`:"";
      return {id:q.id+"_confrontation",icon:"⚔️",chapter:`Quest ${q.serial+1} · Chapter V`,questTitle:d.title,title:`Confronting ${d.threat}`,
      text:`You reach the heart of ${d.place}. ${cap(d.threat)} waits beside ${d.relic} and offers its own account of the conflict.${memory} Everything you learned on the way gives you choices that were not available when the quest began.`,
      choices:[
        {label:"Fight and end the threat",desc:"Trust your strength and what you learned.",outcome:`You reject every bargain. ${d.threat} prepares to settle the matter in battle.`,effects:[{t:"flag",id:k("defeated")},{t:"combat",tier:"elite"}]},
        {label:"Negotiate a binding peace",desc:`Use your discoveries to force both sides to compromise. Preparation has reduced this check to DC ${dc}.`,check:{ability:"charisma",skill:"Persuasion",dc},outcome:`You use the secret—${d.secret}—to bind ${d.threat} and ${d.patron} to a new agreement.`,effects:[{t:"flag",id:k("peace")},{t:"xp",v:34}],failureOutcome:`${cap(d.threat)} recognizes a weakness in your argument and attacks before you can recover.`,failureEffects:[{t:"flag",id:k("defeated")},{t:"combat",tier:"elite"}]},
        {label:"Turn the relic against the threat",desc:`Solve the conflict through knowledge and preparation. Preparation has reduced this check to DC ${dc}.`,check:{ability:"intelligence",skill:"Arcana",dc},outcome:`Your understanding of ${d.relic} lets you sever ${d.threat}'s hold over this place without a battle.`,effects:[{t:"flag",id:k("outwitted")},{t:"xp",v:32},{t:"item",rarity:"raro"}],failureOutcome:`You activate ${d.relic} incorrectly. ${cap(d.threat)} absorbs part of its power and attacks.`,failureEffects:[{t:"damage",pct:.08},{t:"flag",id:k("defeated")},{t:"combat",tier:"elite"}]},
        {label:"Side with the threat",desc:`Decide that ${d.patron} is the true cause of the suffering.`,outcome:`You accept ${d.threat}'s version of justice. It grants you power, but ${d.patron} will remember the betrayal.`,effects:[{t:"flag",id:k("betrayed_patron")},{t:"atk",v:2},{t:"gold",v:30}]}
      ]};}
    const ending=st.flags[k("peace")]?`You leave ${d.place} under a fragile peace of your own making.`:st.flags[k("outwitted")]?`With ${d.threat} stripped of power, ${d.goal} is finally possible.`:st.flags[k("betrayed_patron")]?`The threat is ended on ${d.threat}'s terms, and ${d.patron} refuses to speak your name.`:`${d.threat} has fallen, and the people affected by the conflict begin the difficult work of rebuilding.`;
    const choices=[
      {label:"Return to the patron",desc:"Report what happened and accept the consequences.",outcome:`${ending} ${d.patron} listens to your account and pays what they can.`,effects:[{t:"flag",id:k("complete")},{t:"gold",v:35},{t:"xp",v:24}]},
      {label:"Stay and help repair the damage",desc:"Make sure victory improves ordinary lives.",outcome:`${ending} You remain until the immediate danger has passed and leave with the gratitude of those who survived.`,effects:[{t:"flag",id:k("complete")},{t:"heal",pct:.35},{t:"xp",v:28}]},
      {label:"Leave before rewards or blame",desc:"Carry the experience into the next chapter.",outcome:`${ending} You depart quietly, keeping ${d.relic} and its lesson in your memory.`,effects:[{t:"flag",id:k("complete")},{t:"xp",v:20}]}
    ];
    if(g.build.lengthId==="infinite"&&(st.questSerial||0)>=2)choices.push({label:"Let this be my final adventure",desc:"Choose to end the wandering here.",outcome:`${ending} You decide that this is where your life as a wandering hero should end.`,effects:[{t:"end",victory:true,ending:`After resolving ${d.title}, you chose a life beyond the road and left the next mystery to another hero.`}]});
    return {id:q.id+"_aftermath",icon:"🌅",chapter:`Quest ${q.serial+1} · Epilogue`,questTitle:d.title,title:"What Remains",text:ending,choices};
  }
  function finaleScene(g){
    const st=storyState(g),q=st.quest||startQuest(g),d=q.data,done=Math.max(1,q.serial);
    return {id:"connected_finale",icon:"🌌",finale:true,chapter:"Final Chapter",questTitle:d.title,title:"The Hand Behind Every Conflict",
      text:`The resolution of ${d.title} reveals the pattern behind your previous adventures. The force that empowered ${d.threat} has been following your choices from the beginning. It waits within ${d.place}, using ${d.relic} as the final key. The allies, secrets and scars from ${done} completed quest${done===1?"":"s"} have led you here.`,
      choices:[
        {label:"Face it in battle",desc:"Bring every lesson and every hard-won advantage into one final fight.",outcome:`You enter the deepest chamber of ${d.place}. The power behind ${d.threat} takes physical form and attacks.`,effects:[{t:"combat",tier:"boss",finalBoss:true}]},
        {label:"Expose the pattern and break it",desc:"Use the accumulated evidence from your adventures.",check:{ability:"intelligence",skill:"Investigation",dc:15},outcome:`You connect every secret, including the truth that ${d.secret}. The pattern collapses when fully understood.`,effects:[{t:"end",victory:true,ending:`You ended the cycle behind ${d.title} by understanding the story more deeply than its author expected.`}],failureOutcome:"One connection is wrong. The pattern closes around you and its master emerges to defend it.",failureEffects:[{t:"combat",tier:"boss",finalBoss:true}]},
        {label:"Pay the price yourself",desc:"Seal the threat by surrendering part of your own story.",outcome:`You bind your memories of ${d.patron}, ${d.threat} and ${d.relic} into the seal. The danger ends, though part of your journey becomes a blank page.`,effects:[{t:"end",victory:true,ending:"You saved the realm by sacrificing the memories of the adventures that brought you there."}]},
        {label:"Walk away from the final answer",desc:"Survive, but leave the pattern intact.",outcome:"You choose survival over resolution. The same pattern will one day begin around another hero.",effects:[{t:"end",victory:false,ending:"You survived the road, but left its deepest conflict unresolved."}]}
      ]};
  }
  E.nextStoryScene=function(g){
    const st=storyState(g), len=D.byId.lengths[g.build.lengthId]||D.lengths[0];
    if(len.storyTurns && st.turn>=len.storyTurns-1){
      st.current=finaleScene(g);
    }else{
      if(!st.quest||st.quest.step>5){
        if(st.quest&&st.quest.data)st.lastQuestSummary=resolutionSummary(st,st.quest);
        startQuest(g);
      }
      st.current=questScene(g);
    }
    st.seen.push(st.current.id);
    g.stageIndex=st.turn;
    g.screen="story";
    g.pending=null; g.currentNode=null; g.combat=null;
    E.save(g);
    return st.current;
  };

  E.newGame=function(build,name,mode){
    build=Object.assign({lengthId:"infinite"},build||{});
    const g=originalNewGame(build,name||"Adventurer",mode);
    const abilities={
      guerrero:{strength:16,dexterity:12,constitution:15,intelligence:9,wisdom:11,charisma:10},
      mago:{strength:8,dexterity:12,constitution:11,intelligence:17,wisdom:14,charisma:10},
      arquero:{strength:11,dexterity:17,constitution:13,intelligence:11,wisdom:15,charisma:9},
      picaro:{strength:9,dexterity:17,constitution:12,intelligence:14,wisdom:11,charisma:14},
      clerigo:{strength:12,dexterity:9,constitution:14,intelligence:11,wisdom:17,charisma:13},
      druida:{strength:10,dexterity:12,constitution:14,intelligence:11,wisdom:17,charisma:10}
    };
    g.player.abilities=Object.assign({},abilities[g.build.classId]||abilities.guerrero);
    g.story={turn:0,current:null,seen:[],flags:{},ending:null,lastOutcome:"",quest:null,questSerial:0,lastQuestSummary:null};
    g.map=[];
    E.nextStoryScene(g);
    if(g.pending&&g.pending.type==="perk") g.screen="perk";
    E.save(g);
    return g;
  };
  E.loadSave=function(){
    const g=originalLoadSave();
    if(g&&!g.story){
      g.story={turn:g.stageIndex||0,current:null,seen:[],flags:{legacy_path:true},ending:null,lastOutcome:"",quest:null,questSerial:0,lastQuestSummary:null};
      g.map=[];
      E.nextStoryScene(g);
    }else if(g&&g.story&&!g.story.quest){
      g.story.current=null;g.story.questSerial=0;g.story.lastQuestSummary=null;
      E.nextStoryScene(g);
    }
    if(g&&!g.player.abilities){
      g.player.abilities={strength:12,dexterity:12,constitution:12,intelligence:12,wisdom:12,charisma:12};
    }
    return g;
  };
  E.choosePerk=function(g,id){
    const ok=originalChoosePerk(g,id);
    if(ok && g.story && g.screen==="map") E.nextStoryScene(g);
    return ok;
  };
  E.currentStory=function(g){return storyState(g).current||E.nextStoryScene(g);};

  function result(g,scene,choice,lines){
    g.pending={type:"storyResult",title:scene.title,icon:scene.icon,chapter:scene.chapter,questTitle:scene.questTitle,outcome:choice.outcome,lines:lines||[]};
    g.screen="storyResult"; E.save(g);
  }
  function addItem(g,rarity){
    const it=E.randomItem(g,rarity||"raro");
    E.addItem(g,it); return it;
  }
  E.storyChoice=function(g,index){
    if(!g||g.screen!=="story") return false;
    const scene=E.currentStory(g), choice=scene.choices[index];
    if(!choice) return false;
    const st=storyState(g), lines=[];
    let effects=choice.effects||[], outcome=choice.outcome||"";
    if(choice.check){
      const score=(g.player.abilities&&g.player.abilities[choice.check.ability])||10;
      const mod=Math.floor((score-10)/2);
      const roll=1+Math.floor(H.getRng(g).next()*20);
      const total=roll+mod;
      const success=roll===20||(roll!==1&&total>=choice.check.dc);
      lines.push({icon:"🎲",text:`d20 ${roll} ${mod>=0?"+":"−"} ${Math.abs(mod)} = ${total} · ${choice.check.skill} DC ${choice.check.dc} · ${success?"SUCCESS":"FAILURE"}`});
      if(!success){effects=choice.failureEffects||[];outcome=choice.failureOutcome||"Your attempt fails and the situation changes.";}
    }
    st.lastOutcome=outcome;
    let nextScreen=null, combat=null, finalBoss=false;
    for(const ef of effects){
      if(ef.t==="flag"){st.flags[ef.id]=true;lines.push({icon:"🧭",text:"This choice may matter later."});}
      else if(ef.t==="gold"){const before=g.player.gold;g.player.gold=Math.max(0,g.player.gold+ef.v);const n=g.player.gold-before;lines.push({icon:"🪙",text:(n>=0?"+":"")+n+" gold."});if(n>0)g.stats.goldEarned+=n;}
      else if(ef.t==="xp"){E.awardXP(g,ef.v);lines.push({icon:"📜",text:"You gain "+ef.v+" experience."});}
      else if(ef.t==="heal"){const n=E.healPlayer(g,E.stats(g).maxHp*ef.pct);lines.push({icon:"💚",text:"You recover "+n+" health."});}
      else if(ef.t==="damage"){const n=Math.max(1,Math.round(E.stats(g).maxHp*ef.pct));g.player.hp=Math.max(0,g.player.hp-n);lines.push({icon:"🩸",text:"You lose "+n+" health."});}
      else if(ef.t==="atk"){g.player.bonus.atk+=ef.v;lines.push({icon:"⚔️",text:"Permanent attack "+(ef.v>0?"+":"")+ef.v+"."});}
      else if(ef.t==="def"){g.player.bonus.def+=ef.v;lines.push({icon:"🛡️",text:"Permanent defense "+(ef.v>0?"+":"")+ef.v+"."});}
      else if(ef.t==="item"){const it=addItem(g,ef.rarity);lines.push({icon:it.icon,text:"You obtain "+it.name+"."});}
      else if(ef.t==="combat" && (!ef.chance||H.getRng(g).chance(ef.chance))){combat=ef.tier||"normal";finalBoss=!!ef.finalBoss;}
      else if(ef.t==="shop") nextScreen="shop";
      else if(ef.t==="rest") nextScreen="rest";
      else if(ef.t==="skillEnding"){
        const power=Object.keys(st.flags).length+g.player.level+(g.stats.nodes||0)/3;
        if(power>=8){st.turn++;g.stats.nodes=(g.stats.nodes||0)+1;st.ending="You broke the gate with the truth gathered throughout your journey.";E.finishRun(g,true);return true;}
        combat="boss";finalBoss=true;
      }else if(ef.t==="end"){st.turn++;g.stats.nodes=(g.stats.nodes||0)+1;st.ending=ef.ending||outcome;E.finishRun(g,!!ef.victory);return true;}
    }
    if(g.player.hp<=0){st.ending="Your wounds finally overcame you far from any safe road.";E.finishRun(g,false);return true;}
    if(combat){
      st.pendingOutcome=outcome;
      E.startCombat(g,combat,{story:true,finalBoss});
      if(g.combat) g.combat.storyFinal=finalBoss;
    }else if(nextScreen==="shop"){
      g.pending={type:"shop",stock:E.makeShopStock(g)};g.screen="shop";E.save(g);
    }else if(nextScreen==="rest"){
      g.pending={type:"rest"};g.screen="rest";E.save(g);
    }else result(g,scene,Object.assign({},choice,{outcome}),lines);
    return true;
  };

  E.finishNode=function(g){
    if(!g.story) return;
    const wasFinal=!!(g.combat&&g.combat.storyFinal);
    const st=storyState(g);
    st.turn++;
    if(st.quest)st.quest.step++;
    g.stats.nodes=(g.stats.nodes||0)+1;
    g.currentNode=null;g.pending=null;g.combat=null;
    g.player.energy=E.stats(g).resMax;
    if(wasFinal){st.ending="You crossed the final threshold and defeated the power behind your journey.";E.finishRun(g,true);return;}
    E.nextStoryScene(g);
  };
  E.storyContinue=function(g){
    if(!g.pending||g.pending.type!=="storyResult") return;
    g.pending=null;
    E.resolveLevelsOr(g,true);
  };

  const oldFinishRun=E.finishRun;
  E.finishRun=function(g,victory){
    if(g.story&&g.combat&&g.combat.storyFinal){g.story.turn++;g.stats.nodes=(g.stats.nodes||0)+1;if(victory)g.story.ending="You crossed the final threshold and defeated the power that had shaped your journey.";}
    if(g.story&&victory&&g.build.lengthId==="infinite"&&!g.story.ending) g.story.ending="Your choices brought the wandering story to a meaningful end.";
    oldFinishRun(g,victory);
  };
})();

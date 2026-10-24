export const parties=['SDP','Kokoomus','Perussuomalaiset','Keskusta','Vihreät','Vasemmistoliitto','RKP','Kristillisdemokraatit','Liike Nyt'];
export const fresh = () => ({phase:'lobby',players:[],round:0,leader:0,team:[],votes:{},missions:{},results:[],cards:[],auditedRound:-1,revolution:[],rejects:0,log:[],chat:[]});
export function size(g) { const n=g.players.length;return (n<=3?[2,2,2,2,2]:n===4?[2,2,3,2,3]:n<7?[2,3,2,3,3]:[2,3,3,4,4])[g.round]; }
function need(ok,msg) { if(!ok) throw new Error(msg); }
export function act(g,id,a,random=Math.random) {
 const p=g.players.find(p=>p.id===id); need(p,'Liity ensin peliin.');
 if(a.type==='chat') { const text=String(a.text||'').trim(); need(text.length>0 && text.length<=400,'Viestin pituus on 1–400 merkkiä.'); g.chat.push({name:p.name,text}); g.chat=g.chat.slice(-60); return; }
 if(a.type==='party') {need(g.phase==='lobby' && parties.includes(a.party),'Puoluetta voi vaihtaa vain ennen istuntoa.');p.party=a.party;return;}
 if(a.type==='reset') { need(g.players[0].id===id && g.phase==='ended','Vain isäntä voi avata uuden pelin pelin päätyttyä.'); Object.assign(g,{...fresh(),players:g.players.map(({id,name,token,party})=>({id,name,token,party}))}); return; }
 if(a.type==='start') {
  need(g.phase==='lobby' && g.players[0].id===id,'Vain isäntä aloittaa pelin.'); need(g.players.length>=3,'Tarvitaan vähintään 3 pelaajaa.');need(new Set(g.players.map(p=>p.party)).size>=2,'Tarvitaan vähintään kahden puolueen pelaajia.');
  const shuffled=[...g.players]; for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  shuffled.forEach((p,i)=>{p.role=i<(g.players.length<=4?1:Math.floor((g.players.length-1)/3)+1)?'poison':'forest';p.spores=g.players.length<=4&&p.role==='poison'?4:2;});
  g.phase='nominate';g.log.push('Sienivaliokunnan istunto alkoi.'); return;
 }
 if(a.type==='revolution') {
  need(g.phase==='nominate' && (g.rejects>=3 || (g.results.length>=2 && g.results.some(r=>!r.success))),'Vallankumous vaatii poliittisen kriisin ja ehdotusvaiheen.');
  need(!g.revolution.includes(id),'Olet jo sitoutunut vallankumoukseen.');need(p.spores>=2,'Liittyminen maksaa kaksi itiötä.');
  p.spores-=2;g.revolution.push(id);g.log.push(`${p.name} liittyi sosialistiseen vallankumoukseen: sienisato yhteisomistukseen!`);
  const represented=new Set(g.players.filter(p=>g.revolution.includes(p.id)).map(p=>p.party)).size;
  const needed=Math.min(3,new Set(g.players.map(p=>p.party)).size);
  if(g.revolution.length>=Math.ceil(g.players.length*2/3) && represented>=needed){g.phase='ended';g.winner='revolution';g.log.push('Sosialistinen vallankumous voitti. Sienisato siirtyy yhteisomistukseen; vallankumoukseen sitoutuneet voittavat.');}return;
 }
 if(a.type==='audit') {
  need(g.phase==='nominate' && g.round>0,'Näytteitä voi tutkia edellisen retken jälkeen, ehdotusvaiheessa.');
  need(g.auditedRound!==g.round,'Tämän kierroksen tutkimusvuoro on käytetty.');
  const cards=g.cards[g.round-1];need(cards && a.target in cards,'Valitse edelliselle retkelle osallistunut pelaaja.');
  need(p.spores>=2,'Tutkimus maksaa kaksi itiötä.');p.spores-=2;g.auditedRound=g.round;
  g.log.push(`${p.name} käytti kaksi itiötä näytetarkastukseen: ${g.players.find(p=>p.id===a.target).name} antoi retkellä ${g.round} ${cards[a.target]?'MYRKKYÄ':'TUKEA'}. Tukikortti ei todista roolia.`);return;
 }
 if(a.type==='nominate') {
  need(g.phase==='nominate' && g.players[g.leader].id===id,'Odota puheenjohtajan ehdotusta.');
  need(Array.isArray(a.team) && a.team.length===size(g) && new Set(a.team).size===a.team.length && a.team.every(id=>g.players.some(p=>p.id===id)),'Valitse oikean kokoinen retkikunta.');
  need(new Set(a.team.map(id=>g.players.find(p=>p.id===id).party)).size>=2,'Retkikunta tarvitsee vähintään kaksi puoluetta.');
  g.team=a.team;g.votes={};g.phase='vote';g.log.push(`${p.name} ehdotti retkikuntaa: ${g.team.map(id=>g.players.find(p=>p.id===id).name).join(', ')}.`);return;
 }
 if(a.type==='vote') {
  need(g.phase==='vote' && !(id in g.votes) && typeof a.yes==='boolean','Ääni on jo annettu tai äänestys on ohi.');g.votes[id]=a.yes;
  if(Object.keys(g.votes).length===g.players.length) {
   const yes=Object.values(g.votes).filter(Boolean).length;
   g.log.push(`Äänestys ${yes}–${g.players.length-yes}: ${g.players.map(p=>`${p.name} ${g.votes[p.id]?'jaa':'ei'}`).join(', ')}.`);
   const partySupport=parties.filter(party=>{const members=g.players.filter(p=>p.party===party);return members.length>0 && members.filter(p=>g.votes[p.id]).length>members.length/2;});
   g.log.push(`Puolueiden enemmistöt: ${partySupport.join(', ')||'ei yhtään'} (${partySupport.length} puoluetta).`);
   if(yes>g.players.length/2 && partySupport.length>=2){g.phase='mission';g.missions={};g.rejects=0;}
   else {g.rejects++;g.leader=(g.leader+1)%g.players.length;g.phase='nominate';if(g.rejects===5){g.phase='ended';g.winner='poison';g.log.push('Viisi hylättyä ehdotusta: myrkyttäjät voittivat.');}}
  }return;
 }
 if(a.type==='mission') {
  need(g.phase==='mission' && g.team.includes(id) && !(id in g.missions),'Et voi enää osallistua tähän retkeen.');need(typeof a.poison==='boolean' && (!a.poison || p.role==='poison'),'Metsän puolustaja voi vain tukea retkeä.');
  need(!a.poison || p.spores>=2,'Myrkyttäminen maksaa kaksi itiötä.');
  p.spores=a.poison?p.spores-2:Math.min(4,p.spores+1);g.missions[id]=a.poison;
  if(Object.keys(g.missions).length===g.team.length) {
   const poison=Object.values(g.missions).filter(Boolean).length;const success=poison===0;
   g.cards.push({...g.missions});g.results.push({success,poison,team:[...g.team]});g.log.push(`Retki ${g.round+1}: ${success?'uudistus hyväksyttiin':'sato myrkytettiin'} (${poison} myrkkykorttia).`);
   const wins=g.results.filter(r=>r.success===success).length;
   if(wins===3){g.phase='ended';g.winner=success?'forest':'poison';}
   else {g.round++;g.leader=(g.leader+1)%g.players.length;g.phase='nominate';}
  }return;
 }
 throw new Error('Tuntematon toiminto.');
}
export function view(g,id) {
 const me=g.players.find(p=>p.id===id);
 return {...g,cards:undefined,players:g.players.map(p=>({id:p.id,name:p.name,party:p.party,...(p.id===id?{spores:p.spores}:{}),...(g.phase==='ended'||p.id===id||(me?.role==='poison'&&p.role==='poison')?{role:p.role}:{})})),votes:undefined,missions:undefined,voted:Object.keys(g.votes),submitted:Object.keys(g.missions),me:id,teamSize:size(g)};
}

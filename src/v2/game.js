export const PARTIES=['SDP','Kokoomus','Perussuomalaiset','Keskusta','Vihreät','Vasemmistoliitto','RKP','Kristillisdemokraatit','Liike Nyt'];
export const DISTRICTS=[
 {id:'hall',name:'Sienitalo',tag:'VALTA',text:'Hallitsijalle 1 maine joka kierros.',icon:'hall'},
 {id:'market',name:'Kauppatori',tag:'RAHA',text:'Hallitsijalle 3 kolikkoa joka kierros.',icon:'coin'},
 {id:'press',name:'Iltarihmasto',tag:'MEDIA',text:'Hallitsijalle 1 maine ja 1 kolikko.',icon:'eye'},
 {id:'lab',name:'Itiölaboratorio',tag:'ITIÖT',text:'Hallitsijalle 2 itiötä joka kierros.',icon:'flask'},
 {id:'forest',name:'Korpisalo',tag:'SATO',text:'Hallitsijalle 1 itiö ja 2 kolikkoa.',icon:'forest'}
];
export const CARDS=[
 {id:'campaign',name:'Torikokous',type:'VALTA',text:'Saat 3 vaikutusvaltaa valitsemaasi paikkaan.',target:'district',coins:2,spores:0,icon:'hall'},
 {id:'roots',name:'Hyvä veli -rihmasto',type:'VERKOSTO',text:'Saat 2 vaikutusvaltaa paikkaan ja 1 itiön.',target:'district',coins:1,spores:0,icon:'roots'},
 {id:'sabotage',name:'Myrkkyä koneistoon',type:'SABOTAASI',text:'Paikan vahvin vastustaja menettää 3 vaikutusvaltaa. Saat 1 epäilyn.',target:'district',coins:0,spores:2,icon:'poison'},
 {id:'scandal',name:'Lööppipommi',type:'SKANDAALI',text:'Vastustaja menettää 2 mainetta. Saat 1 maineen ja 1 epäilyn.',target:'player',coins:2,spores:0,icon:'eye'},
 {id:'windfall',name:'Vaalirahoitus',type:'RAHA',text:'Saat 5 kolikkoa. Kukaan ei kysy mistä.',target:'none',coins:0,spores:0,icon:'coin'},
 {id:'harvest',name:'Salainen sienipaikka',type:'SATO',text:'Saat 3 itiötä ja 1 kolikon.',target:'none',coins:0,spores:0,icon:'mushroom'},
 {id:'leak',name:'Tietovuoto',type:'TIEDUSTELU',text:'Näet vastustajan salaisen tavoitteen ja kortit. Saat 1 maineen.',target:'player',coins:0,spores:1,icon:'eye'},
 {id:'shield',name:'Diplomaattinen koskemattomuus',type:'SUOJA',text:'Torju seuraava sinuun kohdistuva hyökkäys.',target:'none',coins:1,spores:0,icon:'shield'},
 {id:'coup',name:'Kabinetin vallankaappaus',type:'KAAPPAUS',text:'Vahvin vastustaja menettää 2 vaikutusvaltaa. Saat itse 2. Saat 1 epäilyn.',target:'district',coins:0,spores:3,icon:'flag'},
 {id:'fundraiser',name:'Talkooilta',type:'MAINE',text:'Saat 2 kolikkoa ja 1 maineen.',target:'none',coins:0,spores:0,icon:'hands'},
 {id:'press',name:'Puhdas julkisivu',type:'MAINE',text:'Saat 2 mainetta. Epäily vähenee yhdellä.',target:'none',coins:2,spores:0,icon:'sun'},
 {id:'revolution',name:'Sosialistinen vallankumous',type:'MULLISTUS',text:'Kaikkien vaikutusvalta jokaisessa paikassa putoaa enintään yhteen. Rikkain antaa köyhimmälle 3 kolikkoa. Saat 2 mainetta.',target:'none',coins:0,spores:3,icon:'flag'}
];
export const AGENDAS=[
 {id:'tycoon',name:'Varjomesenaatti',text:'Lopussa 1 lisäpiste jokaista 2 kolikkoa kohden (enintään 6).'},
 {id:'naturalist',name:'Itiöparoni',text:'Lopussa 1 lisäpiste jokaista itiötä kohden (enintään 6).'},
 {id:'kingmaker',name:'Kabinettihai',text:'Lopussa 3 lisäpistettä jokaista hallitsemaasi paikkaa kohden (enintään 6).'},
 {id:'agitator',name:'Likaisen työn tekijä',text:'Lopussa 2 lisäpistettä jokaista onnistunutta hyökkäystäsi kohden (enintään 6).'},
 {id:'patron',name:'Kansan sankari',text:'Lopussa 1 lisäpiste jokaista kriisiin lahjoittamaasi kolikkoa kohden (enintään 6).'},
 {id:'collector',name:'Lonkerot kaikkialla',text:'Lopussa 2 lisäpistettä jokaisesta paikasta, jossa sinulla on vähintään 2 vaikutusvaltaa (enintään 6).'}
];
const EVENTS=[
 {id:'boom',name:'Sienibuumi',text:'Rahankeruu tuottaa tällä kierroksella 4 kolikkoa.',crisis:'Tori tulvii. Rahoittakaa sienisadon jakelu.'},
 {id:'rain',name:'Itiösade',text:'Itiöiden keruu tuottaa tällä kierroksella 3 itiötä.',crisis:'Laboratorio vuotaa. Rahoittakaa puhdistus.'},
 {id:'media',name:'Mediakuume',text:'Iltarihmastoon lisätty vaikutusvalta saa +1 bonuksen.',crisis:'Huhumylly kiehuu. Rahoittakaa riippumaton tutkinta.'},
 {id:'amnesty',name:'Yleinen armahdus',text:'Jokaisen epäily nollautuu. Uusi alku, samat aikeet.',crisis:'Sienitalon katto romahti. Rahoittakaa korjaus.'},
 {id:'shortage',name:'Kato käy kukkarolle',text:'Kierroksen alussa rikkain menettää 2 kolikkoa, köyhin saa 2.',crisis:'Metsän reunalla on nälkä. Rahoittakaa yhteiskeittiö.'},
 {id:'rally',name:'Vaalien viimeinen viikko',text:'Paikan vahvistaminen tuottaa tällä kierroksella 3 vaikutusvaltaa.',crisis:'Vaalipaikat tarvitsevat talkooapua. Rahoittakaa järjestelyt.'}
];
const need=(v,m)=>{if(!v)throw Error(m)};
const choose=(arr,r)=>arr[Math.min(arr.length-1,Math.floor(r()*arr.length))];
const clamp=n=>Math.max(0,Math.min(15,n));
export const fresh=()=>({version:2,phase:'lobby',round:0,players:[],districts:DISTRICTS.map(d=>({...d,influence:{}})),log:[],chat:[],serial:0,event:null,crisis:null,market:[],deadline:0,winners:[],deck:[],revolutionDrawn:false});
function log(g,text){g.log.push({id:++g.serial,round:g.round,text});g.log=g.log.slice(-90)}
const DECK_COUNTS={campaign:8,roots:6,sabotage:5,scandal:4,windfall:4,harvest:4,leak:3,shield:3,coup:2,fundraiser:5,press:5,revolution:1};
function card(g,r){
 if(!g.deck?.length){g.deck=Object.entries(DECK_COUNTS).flatMap(([id,n])=>Array(id==='revolution'&&g.revolutionDrawn?0:n).fill(id));for(let i=g.deck.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[g.deck[i],g.deck[j]]=[g.deck[j],g.deck[i]]}}
 const id=g.deck.pop();if(id==='revolution')g.revolutionDrawn=true;return id;
}
function marketCard(g,r,exclude=[]){const skipped=[];let id;for(let i=0;i<30;i++){id=card(g,r);if(!exclude.includes(id))break;skipped.push(id)}g.deck.unshift(...skipped);return id}

export function owner(d){let best=0,ids=[];for(const [id,value] of Object.entries(d.influence)){if(value>best){best=value;ids=[id]}else if(value===best&&best>0)ids.push(id)}return ids.length===1?ids[0]:null}
function influence(g,d,p,n){const bonus=n>0&&g.event?.id==='media'&&d.id==='press'?1:0;d.influence[p.id]=Math.max(0,Math.min(8,(d.influence[p.id]||0)+n+bonus))}
function add(p,field,n){p[field]=field==='prestige'?Math.max(0,p[field]+n):clamp(p[field]+n)}
function rival(g,d,id){return g.players.filter(p=>p.id!==id&&(d.influence[p.id]||0)>0).sort((a,b)=>(d.influence[b.id]||0)-(d.influence[a.id]||0))[0]}
function hit(g,p,target,fn){if(target.shield){target.shield=false;log(g,`${target.name}: koskemattomuus torjui hyökkäyksen.`);return false}fn();p.attacks++;return true}
function heat(g,p){p.heat++;if(p.heat>=3){add(p,'prestige',-2);p.heat=0;log(g,`${p.name} jäi kiinni suhmuroinnista: −2 mainetta.`)}}
export function agendaBonus(g,p){switch(p.agenda){case'tycoon':return Math.min(6,Math.floor(p.coins/2));case'naturalist':return Math.min(6,p.spores);case'kingmaker':return Math.min(6,g.districts.filter(d=>owner(d)===p.id).length*3);case'agitator':return Math.min(6,p.attacks*2);case'patron':return Math.min(6,p.donated);case'collector':return Math.min(6,g.districts.filter(d=>(d.influence[p.id]||0)>=2).length*2);default:return 0}}
export function score(g,p){return p.prestige+g.districts.filter(d=>owner(d)===p.id).length*2+agendaBonus(g,p)}
function beginRound(g,r,now){g.round++;g.event={...choose(EVENTS.filter(e=>e.id!==g.event?.id),r)};g.crisis={goal:g.players.length*2,paid:0,donors:{}};g.deadline=now+90000;
 for(const p of g.players){p.ap=3;p.done=false;p.plot=null;add(p,'coins',2);for(let i=0;i<2&&p.hand.length<6;i++)p.hand.push(card(g,r));if(g.event.id==='amnesty')p.heat=0}
 for(const d of g.districts){const p=g.players.find(p=>p.id===owner(d));if(!p)continue;if(d.id==='hall')add(p,'prestige',1);if(d.id==='market')add(p,'coins',3);if(d.id==='press'){add(p,'prestige',1);add(p,'coins',1)}if(d.id==='lab')add(p,'spores',2);if(d.id==='forest'){add(p,'spores',1);add(p,'coins',2)}}
 if(g.event.id==='shortage'){const sorted=[...g.players].sort((a,b)=>b.coins-a.coins);add(sorted[0],'coins',-2);add(sorted.at(-1),'coins',2)}
 g.market=[];for(let i=0;i<3;i++)g.market.push(marketCard(g,r,g.market));log(g,`Kierros ${g.round}/6: ${g.event.name}. Jokaisella on kolme tekoa.`)
}
function finishRound(g,r,now){
 const order=[...g.players];for(let i=order.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
 for(const p of order){const plot=p.plot;if(!plot)continue;const d=g.districts.find(d=>d.id===plot.target);if(plot.kind==='infiltrate'){influence(g,d,p,3);log(g,`${p.name}: salainen soluttautuminen, +3 vaikutusvaltaa paikkaan ${d.name}.`)}if(plot.kind==='sabotage'){const t=rival(g,d,p.id);if(t&&hit(g,p,t,()=>influence(g,d,t,-3)))heat(g,p);log(g,`${p.name}: yön tihutyö paikassa ${d.name}.`)}if(plot.kind==='patron'){add(p,'prestige',3);log(g,`${p.name}: nimetön mesenaatti, +3 mainetta.`)}}
 const success=g.crisis.paid>=g.crisis.goal;
 for(const p of g.players){add(p,'prestige',success?1:-1);if(!success)add(p,'coins',-1);if(success&&g.crisis.donors[p.id])add(p,'prestige',1)}
 log(g,success?'Yhteinen kriisi ratkaistiin: kaikille +1 maine, lahjoittajille vielä +1.':'Kriisi jätettiin hoitamatta: kaikki menettivät 1 maineen ja 1 kolikon.');
 if(g.round===6){g.phase='ended';const max=Math.max(...g.players.map(p=>score(g,p)));g.winners=g.players.filter(p=>score(g,p)===max).map(p=>p.id);log(g,`Valta vaihtui. Voitto: ${g.players.filter(p=>g.winners.includes(p.id)).map(p=>p.name).join(' ja ')} (${max} pistettä).`)}else beginRound(g,r,now)
}
export function addPlayer(g,{id,token,name,party}){need(g.phase==='lobby','Peli on jo alkanut. Luo oma huone tai odota seuraavaa peliä.');need(g.players.length<6,'Huoneessa on jo kuusi pelaajaa.');need(!g.players.some(p=>p.name.toLocaleLowerCase('fi')===name.toLocaleLowerCase('fi')),'Nimi on jo käytössä.');g.players.push({id,token,name,party:PARTIES.includes(party)?party:PARTIES[g.players.length%PARTIES.length],coins:4,spores:2,prestige:0,ap:0,hand:[],agenda:null,plot:null,shield:false,heat:0,attacks:0,donated:0,intel:[],done:false});}
export function act(g,id,a,r=Math.random,now=Date.now()){
 const p=g.players.find(p=>p.id===id);need(p,'Liity ensin huoneeseen.');
 if(a.type==='chat'){const text=String(a.text||'').trim();need(text.length>0&&text.length<=300,'Viestin pituus on 1–300 merkkiä.');g.chat.push({id:++g.serial,name:p.name,text});g.chat=g.chat.slice(-50);return}
 if(a.type==='start'){need(g.phase==='lobby'&&g.players[0].id===id,'Vain isäntä aloittaa pelin.');need(g.players.length>=2,'Kutsu vähintään yksi ystävä.');const agendas=[...AGENDAS];for(const player of g.players){const n=Math.floor(r()*agendas.length);player.agenda=agendas.splice(n,1)[0].id;player.hand=[card(g,r),card(g,r)];}g.phase='playing';beginRound(g,r,now);return}
 if(a.type==='reset'){need(g.phase==='ended'&&g.players[0].id===id,'Vain isäntä voi avata uuden pelin tuloksen jälkeen.');const players=g.players.map(({id,token,name,party})=>({id,token,name,party}));Object.assign(g,fresh());for(const player of players)addPlayer(g,player);return}
 need(g.phase==='playing','Istunto ei ole käynnissä.');
 if(a.type==='advance'){need(g.players[0].id===id&&now>=g.deadline,'Isäntä voi ohittaa poissaolevat 90 sekunnin kuluttua kierroksen alusta.');for(const q of g.players){q.done=true;q.ap=0}return}
 need(!p.done&&p.ap>0,'Tämän kierroksen teot on käytetty. Päätä kierros tai odota muita.');
 if(a.type==='end'){p.done=true;p.ap=0;return}
 const d=g.districts.find(d=>d.id===a.target),t=g.players.find(q=>q.id===a.target&&q.id!==p.id);
 if(a.type==='income'){add(p,'coins',g.event.id==='boom'?4:3);log(g,`${p.name} keräsi vaalirahaa.`)}
 else if(a.type==='forage'){add(p,'spores',g.event.id==='rain'?3:2);log(g,`${p.name} kävi sienessä.`)}
 else if(a.type==='influence'){need(d,'Valitse paikka kartalta.');need(p.coins>=2,'Tarvitset 2 kolikkoa.');p.coins-=2;influence(g,d,p,g.event.id==='rally'?3:2);log(g,`${p.name} vahvisti asemaansa: ${d.name}.`)}
 else if(a.type==='donate'){need(!g.crisis.closed,'Kriisi on jo ratkaistu.');const n=Number(a.amount);need(Number.isInteger(n)&&n>=1&&n<=3&&p.coins>=n,'Lahjoita 1–3 kolikkoa.');p.coins-=n;p.donated+=n;g.crisis.paid+=n;g.crisis.donors[id]=(g.crisis.donors[id]||0)+n;g.crisis.closed=g.crisis.paid>=g.crisis.goal;log(g,`${p.name} lahjoitti yhteiseen kriisiin ${n} kolikkoa.`)}
 else if(a.type==='buy'){need(Number.isInteger(a.index)&&g.market[a.index],'Valitse avoin kortti.');need(p.coins>=1,'Tarvitset 1 kolikon.');need(p.hand.length<6,'Kädessä voi olla enintään kuusi korttia.');p.coins--;p.hand.push(g.market[a.index]);g.market[a.index]=marketCard(g,r,g.market.filter((_,i)=>i!==a.index));log(g,`${p.name} hankki uuden kortin.`)}
 else if(a.type==='plot'){need(!p.plot,'Voit valmistella yhden juonen kierroksessa.');need(['infiltrate','sabotage','patron'].includes(a.kind),'Tuntematon juoni.');need(a.kind==='patron'||d,'Valitse juonen kohdepaikka.');const coins=a.kind==='patron'?3:a.kind==='infiltrate'?2:0,spores=a.kind==='sabotage'?2:1;need(p.coins>=coins&&p.spores>=spores,'Juoneen ei ole riittävästi rahaa tai itiöitä.');p.coins-=coins;p.spores-=spores;p.plot={kind:a.kind,target:d?.id};log(g,`${p.name} sulki kirjekuoren. Juoni paljastuu kierroksen lopussa.`)}
 else if(a.type==='play'){
  need(Number.isInteger(a.index)&&p.hand[a.index],'Kortti ei ole enää kädessäsi.');const c=CARDS.find(c=>c.id===p.hand[a.index]);need(c.target!=='district'||d,'Valitse kohdepaikka.');need(c.target!=='player'||t,'Valitse toinen pelaaja.');need(p.coins>=c.coins&&p.spores>=c.spores,'Korttiin ei ole riittävästi rahaa tai itiöitä.');
  if(c.id==='sabotage')need(rival(g,d,id),'Tässä paikassa ei ole vastustajan vaikutusvaltaa.');if(c.id==='shield')need(!p.shield,'Koskemattomuutesi on jo voimassa.');
  p.coins-=c.coins;p.spores-=c.spores;p.hand.splice(a.index,1);
  switch(c.id){
   case'campaign':influence(g,d,p,3);break;case'roots':influence(g,d,p,2);add(p,'spores',1);break;
   case'sabotage':case'coup':{const q=rival(g,d,id);if(q&&hit(g,p,q,()=>influence(g,d,q,c.id==='coup'?-2:-3)))heat(g,p);if(c.id==='coup')influence(g,d,p,2);break}
   case'scandal':if(hit(g,p,t,()=>{add(t,'prestige',-2);add(p,'prestige',1)}))heat(g,p);break;
   case'windfall':add(p,'coins',5);break;case'harvest':add(p,'spores',3);add(p,'coins',1);break;
   case'leak':p.intel=p.intel.filter(i=>i.target!==t.id);p.intel.push({target:t.id,name:t.name,agenda:t.agenda,hand:[...t.hand],round:g.round});add(p,'prestige',1);break;
   case'shield':p.shield=true;break;case'fundraiser':add(p,'coins',2);add(p,'prestige',1);break;case'press':add(p,'prestige',2);p.heat=Math.max(0,p.heat-1);break;
   case'revolution':{for(const place of g.districts)for(const k of Object.keys(place.influence))place.influence[k]=Math.min(1,place.influence[k]);const sorted=[...g.players].sort((a,b)=>b.coins-a.coins);if(sorted[0].coins>sorted.at(-1).coins){const n=Math.min(3,sorted[0].coins);add(sorted[0],'coins',-n);add(sorted.at(-1),'coins',n)}add(p,'prestige',2);break}
  }log(g,`${p.name} pelasi kortin ${c.name}${d?' → '+d.name:t?' → '+t.name:''}.`)
 }else throw Error('Tuntematon toiminto.');
 p.ap--;if(!p.ap)p.done=true;
}
export function settle(g,r=Math.random,now=Date.now()){
 if(g.phase==='playing'&&g.players.every(p=>p.done))finishRound(g,r,now);
}
export function view(g,id,now=Date.now()){
 const me=g.players.find(p=>p.id===id),ended=g.phase==='ended';
 return {version:2,phase:g.phase,round:g.round,deadline:g.deadline,now,me:me?.id||'',host:g.players[0]?.id,log:g.log,chat:g.chat,event:g.event,crisis:g.crisis,market:g.market,winners:g.winners,
 districts:g.districts.map(d=>({...d,owner:owner(d)})),
 players:g.players.map(p=>({id:p.id,name:p.name,party:p.party,coins:p.coins,spores:p.spores,prestige:p.prestige,ap:p.ap,done:p.done,heat:p.heat,shield:p.shield,handCount:p.hand.length,plotReady:!!p.plot,controlled:g.districts.filter(d=>owner(d)===p.id).length,publicScore:p.prestige+g.districts.filter(d=>owner(d)===p.id).length*2,...(p.id===id||ended?{agenda:p.agenda,bonus:agendaBonus(g,p),score:score(g,p)}:{}),...(p.id===id?{hand:p.hand,plot:p.plot,intel:p.intel}:{} )})),catalog:CARDS,agendas:AGENDAS};
}

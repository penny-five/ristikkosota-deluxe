import {fresh,act,view,parties} from './game.js';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type,apikey,x-client-info','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
export function gameAPI(store) {
 return async function(req) {
  if(req.method==='OPTIONS')return json({});
  const path=new URL(req.url).pathname.split('/').filter(Boolean).at(-1);
  if(!['state','join','action'].includes(path))return json({error:'Tuntematon reitti.'},404);
  if(!['GET','POST'].includes(req.method) || (path==='state')!==(req.method==='GET'))return json({error:'Metodi ei ole tuettu.'},405);
  const token=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
  let a;
  if(req.method==='POST'){
   try {
    // Bound the actual stream as well as Content-Length.
    const reader=req.body?.getReader();if(!reader)throw Error();let total=0;const chunks=[];
    while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>4096){await reader.cancel();return json({error:'Liian suuri pyyntö.'},413);}chunks.push(value);}
    const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    a=JSON.parse(new TextDecoder().decode(bytes));if(!a || typeof a!=='object'||Array.isArray(a))throw Error();
   }catch{return json({error:'Virheellinen JSON-pyyntö.'},400);}
  }
  try {
   // Compare-and-swap serializes concurrent requests across Edge Function instances.
   for(let attempt=0;attempt<12;attempt++){
    const snapshot=await store.read();const g=snapshot.state||fresh();const player=g.players.find(p=>p.token===token);
    if(req.method==='GET')return json(view(g,player?.id||''));
    const next=structuredClone(g);let result={};
    try {
     if(path==='join'){
      if(player)return json({token});
      if(g.phase!=='lobby'||g.players.length>=10)throw Error('Peli on käynnissä tai huone on täynnä.');
      const name=String(a.name||'').trim();if(!name||name.length>24)throw Error('Nimessä tulee olla 1–24 merkkiä.');
      if(g.players.some(p=>p.name.toLocaleLowerCase('fi')===name.toLocaleLowerCase('fi')))throw Error('Nimi on jo käytössä.');
      const newToken=crypto.randomUUID();next.players.push({id:crypto.randomUUID(),token:newToken,name,party:parties.includes(a.party)?a.party:parties[g.players.length%parties.length]});result={token:newToken};
     }else{
      act(next,player?.id,a,()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296);
     }
    }catch(e){return json({error:e.message},400);}
    if(await store.compareAndSwap(snapshot.revision,next))return json(result);
   }
   return json({error:'Huoneessa on ruuhkaa. Yritä uudelleen.'},409);
  }catch{return json({error:'Pelitilan tallennus ei ole juuri nyt käytettävissä. Yritä hetken kuluttua.'},503);}
 };
}

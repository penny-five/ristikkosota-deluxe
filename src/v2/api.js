import {fresh,addPlayer,act,settle,view,PARTIES} from './game.js';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type,apikey,x-client-info','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const makeCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%31]).join('');
export function gameAPI(storeFor,{now=Date.now,rng=random}={}){
 return async req=>{
  if(req.method==='OPTIONS')return json({});
  const url=new URL(req.url),path=url.pathname.split('/').filter(Boolean).at(-1);
  if(!['state','create','join','action'].includes(path))return json({error:'Tuntematon reitti.'},404);
  if(req.method!==(path==='state'?'GET':'POST'))return json({error:'Metodi ei ole tuettu.'},405);
  let a={};
  if(req.method==='POST')try{
   const reader=req.body?.getReader();if(!reader)throw Error();let length=0;const chunks=[];
   while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>4096){await reader.cancel();return json({error:'Liian suuri pyyntö.'},413)}chunks.push(value)}
   const bytes=new Uint8Array(length);let i=0;for(const c of chunks){bytes.set(c,i);i+=c.length}a=JSON.parse(new TextDecoder().decode(bytes));if(!a||typeof a!=='object'||Array.isArray(a))throw Error();
  }catch{return json({error:'Virheellinen JSON-pyyntö.'},400)}
  const room=path==='create'?makeCode():String(url.searchParams.get('room')||'').toUpperCase();
  if(!/^[A-Z2-9]{6}$/.test(room))return json({error:'Huonekoodi on kuusi kirjainta tai numeroa.'},400);
  const token=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
  try{
   const store=storeFor(room);
   for(let retry=0;retry<16;retry++){
    const snapshot=await store.read();if(!snapshot.state&&path!=='create')return json({error:'Huonetta ei löytynyt. Tarkista liittymiskoodi.'},404);
    if(snapshot.state&&path==='create')return json({error:'Koodin arvonta epäonnistui. Kokeile uudelleen.'},409);
    const g=snapshot.state||fresh(),player=g.players.find(p=>p.token&&p.token===token);
    if(path==='state')return json({...view(g,player?.id,now()),room});
    const next=structuredClone(g);let result={room};
    try{
     if(path==='create'||path==='join'){
      if(player)return json({...result,token});
      const name=String(a.name||'').trim();if(!name||name.length>24)throw Error('Nimessä tulee olla 1–24 merkkiä.');
      const id=crypto.randomUUID(),newToken=crypto.randomUUID();addPlayer(next,{id,token:newToken,name,party:PARTIES.includes(a.party)?a.party:undefined});result.token=newToken;
     }else{
      act(next,player?.id,a,rng,now());settle(next,rng,now());
     }
    }catch(e){return json({error:e.message},400)}
    if(await store.compareAndSwap(snapshot.revision,next))return json(result);
   }
   return json({error:'Huoneessa on ruuhkaa. Kokeile uudelleen.'},409);
  }catch{return json({error:'Pelitilan tallennus ei ole juuri nyt käytettävissä. Yritä hetken kuluttua.'},503)}
 }
}

import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {gameAPI} from '../src/api.js';
import {gameAPI as gameV2} from '../src/v2/api.js';
import {supabaseStores} from '../src/v2/store.js';
import {supabaseStore} from '../src/store.js';
const port=Number(process.env.PORT||8787), directory=resolve(process.env.RIHMA_DATA_DIR||'.local');
await mkdir(directory,{recursive:true});
const file=resolve(directory,'room.json');let snapshot={revision:0,state:null};
try{snapshot=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
// Local file adapter serializes writes. Production uses Postgres CAS RPCs.
let queue=Promise.resolve();
const local={read:async()=>{await queue;return structuredClone(snapshot);},compareAndSwap:(revision,state)=>{const job=queue.then(async()=>{if(snapshot.revision!==revision)return false;const next={revision:revision+1,state};await writeFile(file+'.tmp',JSON.stringify(next),{mode:0o600});await rename(file+'.tmp',file);snapshot=next;return true;});queue=job.catch(()=>{});return job;}};
const useSupabase=!!process.env.SUPABASE_URL;
const api=gameAPI(useSupabase?supabaseStore(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY):local);
const stores=new Map();
function roomStore(code){if(!stores.has(code)){
 let pending=Promise.resolve();const roomFile=resolve(directory,'v2-'+code+'.json');let data;
 const load=readFile(roomFile,'utf8').then(s=>data=JSON.parse(s)).catch(e=>{if(e.code!=='ENOENT')throw e;data={revision:0,state:null}});
 stores.set(code,{read:async()=>{await load;await pending;return structuredClone(data)},compareAndSwap:(revision,state)=>{const job=pending.then(async()=>{await load;if(data.revision!==revision)return false;const next={revision:revision+1,state};await writeFile(roomFile+'.tmp',JSON.stringify(next),{mode:0o600});await rename(roomFile+'.tmp',roomFile);data=next;return true});pending=job.catch(()=>{});return job}});
 }return stores.get(code)}
const apiV2=gameV2(useSupabase?supabaseStores(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY):roomStore);
const root=resolve('public');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.webp':'image/webp','.woff2':'font/woff2'};
createServer(async(req,res)=>{try{
 const url=new URL(req.url,`http://localhost:${port}`);
 if(url.pathname.startsWith('/api/')){
  const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});const r=await (url.pathname.startsWith('/api/v2/')?apiV2:api)(request);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!path.startsWith(root+'/')){res.writeHead(403);res.end();return;}
 const body=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
}catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end('Pyyntö epäonnistui.');}}).listen(port,'0.0.0.0',()=>console.log(`Rihmastovalta listening on port ${port} (${useSupabase?'Supabase Postgres':'local persistent file; not a Supabase validation'})`));

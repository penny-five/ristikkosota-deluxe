import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gameAPI} from '../src/api.js';
import {supabaseStore} from '../src/store.js';
function fixture(){let snapshot={revision:0,state:null};return {read:async()=>structuredClone(snapshot),compareAndSwap:async(revision,state)=>{if(revision!==snapshot.revision)return false;snapshot={revision:revision+1,state:structuredClone(state)};return true;}};}
const request=(path,token='',body)=>new Request('https://project.supabase.co/functions/v1/game/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
test('Supabase-compatible API handles concurrent joins and voting without lost updates',async()=>{
 const store=fixture(),api=gameAPI(store);
 const joins=await Promise.all(Array.from({length:5},(_,i)=>api(request('join','',{name:'Player '+i}))));
 assert.ok(joins.every(r=>r.status===200));const tokens=await Promise.all(joins.map(async r=>(await r.json()).token));
 const state=await (await api(request('state'))).json();assert.equal(state.players.length,5);assert.ok(!JSON.stringify(state).includes(tokens[0]));
 const first=await store.read();const hostToken=first.state.players[0].token;
 assert.equal((await api(request('action',hostToken,{type:'start'}))).status,200);
 const g=(await store.read()).state;await api(request('action',hostToken,{type:'nominate',team:g.players.slice(0,2).map(p=>p.id)}));
 await Promise.all(tokens.map(t=>api(request('action',t,{type:'vote',yes:true}))));
 assert.equal((await store.read()).state.phase,'mission');
 const publicState=await (await api(request('state'))).json();assert.equal(publicState.voted.length,5);assert.ok(!publicState.votes);assert.ok(publicState.players.every(p=>!p.role&&!p.token));
});
test('request boundaries, CORS and unavailable storage are handled',async()=>{
 const api=gameAPI(fixture());
 assert.equal((await api(new Request('https://example/game/state',{method:'OPTIONS'}))).headers.get('Access-Control-Allow-Origin'),'*');
 assert.equal((await api(request('missing'))).status,404);
 assert.equal((await api(new Request('https://example/game/join'))).status,405);
 assert.equal((await api(new Request('https://example/game/join',{method:'POST',body:'no json'}))).status,400);
 assert.equal((await api(request('join','',{name:'x'.repeat(5000)}))).status,413);
 assert.equal((await api(request('action','forged',{type:'start'}))).status,400);
 const broken=gameAPI({read:async()=>{throw Error('secret infrastructure detail');}});
 const r=await broken(request('state'));assert.equal(r.status,503);assert.ok(!(await r.text()).includes('secret infrastructure'));
 const conflict=gameAPI({read:async()=>({revision:0,state:null}),compareAndSwap:async()=>false});assert.equal((await conflict(request('join','',{name:'P'}))).status,409);
});
test('database adapter uses server credentials only in outbound headers',async()=>{
 const calls=[];const store=supabaseStore('https://example.supabase.co/','test-service-key',async(url,init)=>{calls.push({url,...init});return Response.json(url.endsWith('rihma_read_room')?{revision:4,state:{}}:true);});
 assert.equal((await store.read()).revision,4);assert.equal(await store.compareAndSwap(4,{phase:'lobby'}),true);
 assert.equal(calls[0].headers.Authorization,'Bearer test-service-key');assert.deepEqual(JSON.parse(calls[1].body),{expected_revision:4,next_state:{phase:'lobby'}});assert.ok(calls.every(c=>!c.url.includes('test-service-key')));
});

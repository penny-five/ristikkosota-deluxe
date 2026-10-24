import assert from 'node:assert/strict';
const base=process.env.SMOKE_URL||'http://127.0.0.1:8787';
async function req(path,token='',data){const r=await fetch(base+'/api/'+path,{method:data?'POST':'GET',headers:{Origin:base,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});const json=await r.json();assert.equal(r.status,200,JSON.stringify(json));return json;}
const initial=await req('state');assert.equal(initial.phase,'lobby','Use a fresh local database for smoke testing');assert.equal(initial.players.length,0);
assert.ok((await (await fetch(base)).text()).includes('Rihmastovalta'));
const tokens=[];for(let i=0;i<5;i++)tokens.push((await req('join','',{name:'Smoke '+i})).token);
const state=await req('state',tokens[0]);assert.ok(!JSON.stringify(state).includes(tokens[0]));
await req('action',tokens[0],{type:'start'});
for(let round=0;round<3;round++){
 const g=await req('state',tokens[0]);const ids=g.players.map(p=>p.id);const team=ids.slice(0,g.teamSize);
 await req('action',tokens[g.leader],{type:'nominate',team});
 await Promise.all(tokens.map(token=>req('action',token,{type:'vote',yes:true})));
 const v=await req('state');assert.equal(v.phase,'mission');assert.ok(!('votes'in v));assert.ok(v.players.every(p=>!p.role));
 for(const id of team)await req('action',tokens[ids.indexOf(id)],{type:'mission',poison:false});
}
const end=await req('state');assert.equal(end.winner,'forest');assert.equal(end.results.length,3);assert.ok(end.players.every(p=>p.role));
await req('action',tokens[0],{type:'reset'});
console.log('HTTP smoke passed: 5 sessions, concurrent voting, 3 missions, hidden data, victory, reset.');
await req('action',tokens[0],{type:'start'});
for(let i=0;i<3;i++){
 const g=await req('state',tokens[0]);
 await req('action',tokens[g.leader],{type:'nominate',team:g.players.slice(0,g.teamSize).map(p=>p.id)});
 await Promise.all(tokens.map(token=>req('action',token,{type:'vote',yes:false})));
}
for(const token of tokens.slice(0,4))await req('action',token,{type:'revolution'});
const revolution=await req('state');assert.equal(revolution.winner,'revolution');assert.equal(revolution.revolution.length,4);
console.log('HTTP revolution passed: crisis, paid commitments, cross-party coalition, collective ownership victory.');

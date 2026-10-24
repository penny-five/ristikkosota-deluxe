import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Postgres migration restricts secret state and atomically rejects stale writes',async()=>{
 const db=new PGlite();
 try{
 await db.exec('create role anon; create role authenticated; create role service_role;');
 const sql=await readFile(new URL('../supabase/migrations/20261024082249_game.sql',import.meta.url),'utf8');
 await db.exec(sql);await db.exec(sql); // Safe to reapply locally.
 await db.exec('set role service_role');
 let r=await db.query('select public.rihma_read_room() as snapshot');assert.deepEqual(r.rows[0].snapshot,{revision:0,state:null});
 const save=async(n,state)=> (await db.query('select public.rihma_save_room($1,$2::jsonb) as saved',[n,JSON.stringify(state)])).rows[0].saved;
 assert.equal(await save(0,{phase:'lobby',secret:'hidden'}),true);
 assert.equal(await save(0,{phase:'bad'}),false);
 assert.equal(await save(1,{phase:'vote',secret:'hidden'}),true);
 assert.equal(await save(1,{phase:'bad'}),false);
 r=await db.query('select public.rihma_read_room() as snapshot');assert.equal(r.rows[0].snapshot.revision,2);assert.equal(r.rows[0].snapshot.state.phase,'vote');
 await db.exec('reset role');
 for(const role of ['anon','authenticated']){
  await db.exec('set role '+role);
  await assert.rejects(()=>db.query('select public.rihma_read_room()'),/permission denied/);
  await assert.rejects(()=>db.query("select public.rihma_save_room(2,'{}'::jsonb)"),/permission denied/);
  await assert.rejects(()=>db.query('select * from rihma_private.room'),/permission denied/);
  await db.exec('reset role');
 }
 }finally{await db.close();}
});

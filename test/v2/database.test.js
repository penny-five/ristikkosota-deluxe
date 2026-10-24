import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
test('multiroom PostgreSQL CAS isolates rooms, rejects stale revisions and denies public access',async()=>{const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;');
 const dir=new URL('../../supabase/migrations/',import.meta.url);const file=process.env.V2_SQL_PATH||new URL((await readdir(dir)).find(f=>f.endsWith('_multiplayer_pivot.sql')),dir);const sql=await readFile(file,'utf8');await db.exec(sql);await db.exec(sql);
 await db.exec('set role service_role');const save=async(room,rev,state)=>(await db.query('select public.rihma_v2_save_room($1,$2,$3::jsonb) as saved',[room,rev,JSON.stringify(state)])).rows[0].saved;
 assert.equal(await save('ABC234',0,{secret:'a'}),true);assert.equal(await save('XYZ678',0,{secret:'b'}),true);assert.equal(await save('ABC234',0,{secret:'overwrite'}),false);assert.equal(await save('ABC234',1,{secret:'new'}),true);assert.equal(await save('ABC234',1,{}),false);
 const b=(await db.query('select public.rihma_v2_read_room($1) as room',['XYZ678'])).rows[0].room;assert.deepEqual(b,{revision:1,state:{secret:'b'}});
 await assert.rejects(()=>save('BAD!',0,{}),/check constraint/);await db.exec('reset role');
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(()=>db.query("select public.rihma_v2_read_room('ABC234')"),/permission denied/);await assert.rejects(()=>db.query("select public.rihma_v2_save_room('ABC234',2,'{}'::jsonb)"),/permission denied/);await assert.rejects(()=>db.query('select * from rihma_v2.rooms'),/permission denied/);await db.exec('reset role');}
 }finally{await db.close()}});

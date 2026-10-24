export function supabaseStores(url,key,fetcher=fetch){
 if(!url||!key)throw Error('Supabase-palvelinasetukset puuttuvat.');
 async function rpc(name,body){const r=await fetcher(url.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error('Tietokantayhteys epäonnistui ('+r.status+').');return r.json()}
 return room=>({read:()=>rpc('rihma_v2_read_room',{room_key:room}),compareAndSwap:(revision,state)=>rpc('rihma_v2_save_room',{room_key:room,expected_revision:revision,next_state:state})});
}

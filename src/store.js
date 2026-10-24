// The service key stays in the Edge Function. Never send it to the browser.
export function supabaseStore(url, key, fetcher=fetch) {
 if(!url || !key)throw new Error('Supabase-palvelinasetukset puuttuvat.');
 async function rpc(name,body={}) {
  const r=await fetcher(`${url.replace(/\/$/,'')}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok)throw new Error(`Tietokantayhteys epäonnistui (${r.status}).`);
  return r.json();
 }
 return {read:()=>rpc('rihma_read_room'),compareAndSwap:(revision,state)=>rpc('rihma_save_room',{expected_revision:revision,next_state:state})};
}

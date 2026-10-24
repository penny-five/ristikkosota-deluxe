import {readFile} from 'node:fs/promises';
const config=await readFile('public/config.js','utf8');
if(!/^window\.RIHMA_API = "https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/game-v2";\s*$/.test(config))throw Error('Määritä julkaistu Supabase-palvelin ensin: npm run configure -- https://<project-ref>.supabase.co/functions/v1/game-v2');
console.log('Frontend points to a Supabase Edge Function.');

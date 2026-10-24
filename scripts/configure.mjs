import {writeFile} from 'node:fs/promises';
const value=process.argv[2];
if(!value || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/game$/.test(value))throw Error('Anna Supabase game -funktion HTTPS-osoite.');
await writeFile('public/config.js',`window.RIHMA_API = ${JSON.stringify(value)};\n`);
console.log('Public API URL configured. No secrets written.');

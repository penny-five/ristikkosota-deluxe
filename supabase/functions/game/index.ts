import {gameAPI} from '../../../src/api.js';
import {supabaseStore} from '../../../src/store.js';
const handler=gameAPI(supabaseStore(Deno.env.get('SUPABASE_URL'),Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')));
Deno.serve(handler);

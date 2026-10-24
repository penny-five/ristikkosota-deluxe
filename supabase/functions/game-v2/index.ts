import {gameAPI} from '../../../src/v2/api.js';
import {supabaseStores} from '../../../src/v2/store.js';
Deno.serve(gameAPI(supabaseStores(Deno.env.get('SUPABASE_URL'),Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))));

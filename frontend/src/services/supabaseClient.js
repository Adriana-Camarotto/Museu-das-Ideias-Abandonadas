import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createNullClient() {
  return {
    auth: {
      async signInWithOAuth() {
        console.error(
          '[Supabase] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sao obrigatorias para login com Google.',
        );
        return { data: null, error: new Error('Supabase nao configurado no frontend.') };
      },
<<<<<<< Updated upstream
      async getSession() {
        return { data: { session: null }, error: null };
      },
=======
      async signInWithPassword() {
        return { data: null, error: new Error('Supabase nao configurado no frontend.') };
      },
      async signUp() {
        return { data: null, error: new Error('Supabase nao configurado no frontend.') };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        };
      },
>>>>>>> Stashed changes
      async signOut() {
        return { error: null };
      },
    },
  };
}

<<<<<<< Updated upstream
let supabaseClient = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error(
    '[Supabase] Cliente nao inicializado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no frontend.',
  );
  supabaseClient = createNullClient();
=======
const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createNullClient();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Cliente nao inicializado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no frontend.',
  );
>>>>>>> Stashed changes
}

export const supabase = supabaseClient;
export default supabaseClient;

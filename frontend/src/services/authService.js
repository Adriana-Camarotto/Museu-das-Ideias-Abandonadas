import { API_ENDPOINTS } from '../config/api';
import supabase from './supabaseClient';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

<<<<<<< Updated upstream
=======
function toAuthUser(sessionUser) {
  if (!sessionUser) return null;

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '',
    avatarUrl: sessionUser.user_metadata?.avatar_url || '',
    provider: sessionUser.app_metadata?.provider || 'supabase',
  };
}

>>>>>>> Stashed changes
export const authService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser() {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  getAuthHeaders() {
    const token = this.getToken();

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async fetchWithAuth(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }

    return payload;
  },

  async authenticate(mode, credentials) {
    const endpoint = mode === 'signup' ? API_ENDPOINTS.signup : API_ENDPOINTS.login;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || 'Nao foi possivel autenticar');
    }

    const session = payload.data;
    if (!session?.token) {
      return session;
    }

    this.setToken(session.token);

    if (session.user) {
      this.setUser(session.user);
    }

    return session;
  },

  async loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw new Error(error.message || 'Nao foi possivel iniciar login com Google');
    }

    return true;
  },

<<<<<<< Updated upstream
=======
  async loginWithPassword({ email, password }) {
    return this.authenticate('login', { email, password });
  },

  async signupWithPassword({ email, password, name }) {
    return this.authenticate('signup', { email, password, name });
  },

>>>>>>> Stashed changes
  async syncSupabaseSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[Supabase] Erro ao sincronizar sessao:', error.message);
<<<<<<< Updated upstream
      return null;
    }

    const session = data?.session;
=======
      return { session: null, user: null, error };
    }

    const session = data?.session ?? null;
    const user = this.persistSupabaseSession(session);

    return { session, user, error: null };
  },

  persistSupabaseSession(session) {
>>>>>>> Stashed changes
    if (!session?.access_token) {
      return null;
    }

    this.setToken(session.access_token);

<<<<<<< Updated upstream
    const user = session.user
      ? {
          id: session.user.id,
          email: session.user.email,
          provider: 'supabase',
        }
      : null;
=======
    const user = toAuthUser(session.user);
>>>>>>> Stashed changes

    if (user) {
      this.setUser(user);
    }

    return user;
  },

<<<<<<< Updated upstream
  login(credentials) {
    return this.authenticate('login', credentials);
  },

  signup(credentials) {
    return this.authenticate('signup', credentials);
  },

  async me() {
    const payload = await this.fetchWithAuth(API_ENDPOINTS.me);
    return payload.data?.user || null;
=======
  onSupabaseAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return data?.subscription || { unsubscribe() {} };
>>>>>>> Stashed changes
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

<<<<<<< Updated upstream
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
=======
  clearLocalSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  clearToken() {
    this.clearLocalSession();
>>>>>>> Stashed changes

    if (supabase?.auth?.signOut) {
      supabase.auth.signOut().catch((error) => {
        console.error('[Supabase] Erro ao fazer signOut:', error?.message || error);
      });
    }
  },

  logout() {
    this.clearToken();
  },
<<<<<<< Updated upstream
=======

  login(credentials) {
    return this.loginWithPassword(credentials);
  },

  signup(credentials) {
    return this.signupWithPassword(credentials);
  },

  async me() {
    const payload = await this.fetchWithAuth(API_ENDPOINTS.me);
    return payload.data?.user || null;
  },
>>>>>>> Stashed changes
};

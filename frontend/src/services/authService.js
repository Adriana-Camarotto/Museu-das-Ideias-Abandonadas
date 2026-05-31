/**
 * Serviço de Autenticação
 * Gerencia tokens JWT para requisições autenticadas
 */

// Em desenvolvimento, usamos um token fake
// Em produção, isso viria do Supabase Auth
const DEV_TOKEN = 'dev-token-' + Date.now();

export const authService = {
  /**
   * Obter token de autenticação
   * Em desenvolvimento, retorna token fake
   * Em produção, retorna token do Supabase
   */
  getToken() {
    // Verificar se há token no localStorage (de login real)
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      return storedToken;
    }

    // Em desenvolvimento, usar token fake
    if (process.env.NODE_ENV === 'development') {
      return DEV_TOKEN;
    }

    return null;
  },

  /**
   * Obter headers com autenticação
   */
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  },

  /**
   * Fazer requisição autenticada
   */
  async fetchWithAuth(url, options = {}) {
    const headers = this.getAuthHeaders();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  /**
   * Armazenar token (para login real)
   */
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Limpar token (logout)
   */
  clearToken() {
    localStorage.removeItem('auth_token');
  },
};

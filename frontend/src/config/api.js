/**
 * Configuração da API
 * Centraliza as URLs dos endpoints do backend
 *
 * Usa URLs relativas para funcionar em qualquer ambiente
 * (desenvolvimento local, staging, produção)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  analyzeIdea: `${API_BASE_URL}/api/ideas/analyze`,
  subscribeAlerts: `${API_BASE_URL}/api/assinar-alertas`,
};

export default API_BASE_URL;

/**
 * Configuração de Variáveis de Ambiente
 * Centraliza todas as variáveis de ambiente com validação
 */

import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['GEMINI_API_KEY'];
const optionalEnvVars = ['PORT', 'NODE_ENV', 'FRONTEND_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];

// Validar variáveis obrigatórias
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Variáveis de ambiente obrigatórias não configuradas: ${missingEnvVars.join(', ')}`);
}

export const config = {
  // Servidor
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Google Gemini
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: 'gemini-2.5-flash',

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;

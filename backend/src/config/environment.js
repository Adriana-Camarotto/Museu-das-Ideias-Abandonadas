/**
 * Configuração de Variáveis de Ambiente
 * Centraliza todas as variáveis de ambiente com validação
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');

dotenv.config({ path: envPath });

const requiredEnvVars = ['GEMINI_API_KEY'];
const optionalEnvVars = {
  PORT: 3001,
  NODE_ENV: 'development',
  SMTP_HOST: null,
  SMTP_PORT: null,
  SMTP_SECURE: false,
  SMTP_USER: null,
  SMTP_PASS: null,
  MAIL_FROM: null,
};

// Validar variáveis obrigatórias
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn(`⚠️ Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
  console.warn(`📍 Procurando .env em: ${envPath}`);
}

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM,
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;

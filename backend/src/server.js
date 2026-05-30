/**
 * MUSEU DAS IDEIAS ABANDONADAS - Backend API (Refatorado)
 * 
 * Servidor Express com arquitetura em camadas:
 * - Controllers: Lógica de requisição
 * - Services: Lógica de negócio
 * - Routes: Definição de endpoints
 * - Middleware: Tratamento transversal
 * 
 * @author Backend Sênior
 * @version 2.0.0
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/environment.js';
import errorHandler from './middleware/errorHandler.js';
import ideasRoutes from './routes/ideas.js';
import aiRoutes from './routes/ai.js';

// Configuração de diretórios para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../../frontend/dist');

// Inicializar Express
const app = express();

// ============================================
// MIDDLEWARES
// ============================================

// CORS com restrição de origem
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Parse JSON
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(frontendPath));

// ============================================
// ROTAS DE SAÚDE
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'O Museu das Ideias Abandonadas está de portas abertas!',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// ============================================
// ROTAS DE API
// ============================================

// Rotas de Ideias
app.use('/api/ideas', ideasRoutes);

// Rotas de IA
app.use('/ai', aiRoutes);

// Compatibilidade com endpoint antigo
app.post('/api/analisar-ideia', (req, res, next) => {
  // Redirecionar para novo endpoint
  req.url = '/api/ideas/analyze';
  ideasRoutes(req, res, next);
});

// ============================================
// ROTA 404
// ============================================

app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ai')) {
    return res.status(404).json({
      success: false,
      error: 'Esta rota também foi abandonada... assim como suas ideias! 💀',
    });
  }

  // Fallback para SPA
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================
// MIDDLEWARE DE ERRO
// ============================================

app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🏛️  MUSEU DAS IDEIAS ABANDONADAS - Backend API       ║
║                                                           ║
║     Versão: 2.0.0 (Refatorado)                           ║
║     Servidor rodando em: http://localhost:${config.port}        ║
║     Ambiente: ${config.nodeEnv}                      ║
║                                                           ║
║     Endpoints disponíveis:                                ║
║     • GET  /api/health                                    ║
║     • POST /api/ideas/analyze                             ║
║     • POST /api/analisar-ideia (compatibilidade)          ║
║     • POST /ai/analyze-idea                               ║
║     • POST /ai/share-text                                 ║
║     • POST /ai/epitaph                                    ║
║                                                           ║
║     Frontend: ${config.frontendUrl}     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});

export default app;

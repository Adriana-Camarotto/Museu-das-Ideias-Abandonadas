/**
 * MUSEU DAS IDEIAS ABANDONADAS - Backend API (Refatorado)
 *
 * Servidor Express que atua como ponte entre o frontend React
 * e a API do Google Gemini para análise de ideias abandonadas.
 *
 * Arquitetura: MVC com separação de concerns
 * - Controllers: Lógica de requisição/resposta
 * - Services: Lógica de negócio
 * - Routes: Definição de endpoints
 * - Middleware: Tratamento de erros e CORS
 *
 * @author Backend Sênior
 * @version 2.0.0 (Refatorado)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar configuração
import { config } from './config/environment.js';

// Importar rotas
import ideaRoutes from './routes/ideas.js';
import newsletterRoutes from './routes/newsletter.js';
import ideaManagementRoutes from './routes/ideaManagement.js';

// Importar middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Configuração de diretórios para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../../museu-das-ideias/dist');

// Inicializar Express
const app = express();

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend (se existirem)
app.use(express.static(frontendPath));

// ============================================
// ROTAS
// ============================================

// Rotas de ideias
app.use('/', ideaRoutes);

// Rotas de newsletter
app.use('/', newsletterRoutes);

// Rotas de gerenciamento de ideias
app.use('/', ideaManagementRoutes);

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// Rota 404
app.use(notFoundHandler);

// Middleware de erro centralizado (deve ser o último)
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
║     Servidor rodando em: http://localhost:${config.port}        ║
║     Ambiente: ${config.nodeEnv}                      ║
║                                                           ║
║     Endpoints disponíveis:                                ║
║     • GET  /health                                        ║
║     • POST /api/analisar-ideia                            ║
║     • POST /api/assinar-alertas                           ║
║     • GET  /api/ideias (com filtro)                       ║
║     • GET  /api/ranking                                   ║
║     • GET  /api/estatisticas                              ║
║     • POST /api/ideias/:id/reviver                        ║
║     • POST /api/ideias/:id/homenagear                     ║
║     • POST /api/ideias/:id/compartilhar                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado (Promise):', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});

export default app;

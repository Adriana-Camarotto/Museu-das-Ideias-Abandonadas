/**
 * Rotas de Gerenciamento de Ideias
 * Endpoints para reviver, homenagear, compartilhar e ranking
 */

import express from 'express';
import IdeaManagementController from '../controllers/IdeaManagementController.js';

const router = express.Router();

/**
 * GET /api/ideias
 * Obtém todas as ideias (com filtro opcional)
 */
router.get('/api/ideias', (req, res) => 
  IdeaManagementController.getAllIdeas(req, res)
);

/**
 * GET /api/ranking
 * Obtém ranking de ideias por homenagens
 */
router.get('/api/ranking', (req, res) => 
  IdeaManagementController.getRanking(req, res)
);

/**
 * GET /api/estatisticas
 * Obtém estatísticas do museu
 */
router.get('/api/estatisticas', (req, res) => 
  IdeaManagementController.getStatistics(req, res)
);

/**
 * POST /api/ideias/:id/reviver
 * Arquiva uma ideia (reviver)
 */
router.post('/api/ideias/:id/reviver', (req, res) => 
  IdeaManagementController.reviveIdea(req, res)
);

/**
 * POST /api/ideias/:id/homenagear
 * Adiciona uma homenagem a uma ideia
 */
router.post('/api/ideias/:id/homenagear', (req, res) => 
  IdeaManagementController.honorIdea(req, res)
);

/**
 * POST /api/ideias/:id/compartilhar
 * Gera mensagem para compartilhamento
 */
router.post('/api/ideias/:id/compartilhar', (req, res) => 
  IdeaManagementController.generateShareMessage(req, res)
);

export default router;

/**
 * Rotas de Ideias
 * Endpoints relacionados a ideias abandonadas
 */

import express from 'express';
import IdeaController from '../controllers/IdeaController.js';

const router = express.Router();

/**
 * GET /health
 * Health check do servidor
 */
router.get('/health', (req, res) => IdeaController.healthCheck(req, res));

/**
 * POST /api/analisar-ideia
 * Analisa uma ideia abandonada
 */
router.post('/api/analisar-ideia', (req, res) => IdeaController.analyzeIdea(req, res));

export default router;

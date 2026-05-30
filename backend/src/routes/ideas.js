/**
 * Rotas de Ideias
 * Endpoints para gerenciar ideias abandonadas
 */

import express from 'express';
import * as IdeaController from '../controllers/IdeaController.js';

const router = express.Router();

// Análise de ideia (compatível com endpoint antigo)
router.post('/analyze', IdeaController.analyzeIdea);

// Listar ideias
router.get('/', IdeaController.listIdeas);

// Obter ideia específica
router.get('/:id', IdeaController.getIdea);

// Adicionar homenagem
router.post('/:id/honor', IdeaController.honorIdea);

// Reviver ideia (arquivar)
router.post('/:id/revive', IdeaController.reviveIdea);

export default router;
